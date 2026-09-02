"""무음 검출 → 보존(발화) 세그먼트 계산.

ffmpeg 의 silencedetect 필터로 무음 구간을 찾고, 그 여집합(=발화 구간)을
계산한다. 컷이 너무 빡빡하지 않도록 발화 구간 양쪽에 padding 을 준다.

시간 단위는 초(float). 드래프트 빌더에서 마이크로초로 변환한다.

길이·해상도·fps 는 pymediainfo 로 읽는다 — pycapcut 이 이미 이 라이브러리에
의존하므로(VideoMaterial 이 사용) 별도 ffprobe 설치가 필요 없다. 무음 검출에는
ffmpeg 이 반드시 필요하다.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from dataclasses import dataclass


class FfmpegNotFound(RuntimeError):
    pass


@dataclass(frozen=True)
class Segment:
    start: float  # 초
    end: float    # 초

    @property
    def duration(self) -> float:
        return self.end - self.start


@dataclass(frozen=True)
class Probe:
    duration: float  # 초
    width: int
    height: int
    fps: int


def _require(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        raise FfmpegNotFound(
            f"{tool} 를 찾을 수 없습니다. 시스템에 ffmpeg 를 설치하세요 (Mac: brew install ffmpeg)."
        )
    return path


def probe(input_path: str) -> Probe:
    """pymediainfo 로 길이·해상도·fps 를 읽는다."""
    from pymediainfo import MediaInfo

    info = MediaInfo.parse(input_path)
    video = next((t for t in info.tracks if t.track_type == "Video"), None)
    if video is None:
        raise RuntimeError(f"비디오 트랙을 찾지 못했습니다: {input_path}")

    width = int(video.width or 0)
    height = int(video.height or 0)

    # 길이(ms) → 초. 비디오 트랙 우선, 없으면 General 트랙.
    dur_ms = video.duration
    if dur_ms is None:
        general = next((t for t in info.tracks if t.track_type == "General"), None)
        dur_ms = general.duration if general else None
    duration = float(dur_ms) / 1000.0 if dur_ms else 0.0

    fps = 30
    try:
        if video.frame_rate:
            fps = round(float(video.frame_rate)) or 30
    except (TypeError, ValueError):
        pass

    if width == 0 or height == 0 or duration == 0.0:
        raise RuntimeError(f"영상 메타데이터를 읽지 못했습니다: {input_path}")
    return Probe(duration=duration, width=width, height=height, fps=fps)


_SILENCE_START = re.compile(r"silence_start:\s*([0-9.]+)")
_SILENCE_END = re.compile(r"silence_end:\s*([0-9.]+)")


def detect_silence(input_path: str, noise_db: float = -30.0, min_silence: float = 0.5) -> list[Segment]:
    """무음 구간 리스트를 반환한다.

    Args:
        noise_db: 이 값(dB) 아래를 무음으로 본다. 낮출수록(예: -40) 더 조용해야 무음.
        min_silence: 이 길이(초) 이상 지속돼야 무음으로 친다.
    """
    ffmpeg = _require("ffmpeg")
    proc = subprocess.run(
        [
            ffmpeg, "-hide_banner", "-nostats",
            "-i", input_path,
            "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}",
            "-f", "null", "-",
        ],
        capture_output=True, text=True,
    )
    log = proc.stderr  # silencedetect 는 stderr 로 출력
    starts = [float(m) for m in _SILENCE_START.findall(log)]
    ends = [float(m) for m in _SILENCE_END.findall(log)]

    silences: list[Segment] = []
    for i, s in enumerate(starts):
        e = ends[i] if i < len(ends) else None
        # 마지막 무음이 영상 끝까지 이어지면 silence_end 가 없을 수 있음 → keep 계산 시 처리
        silences.append(Segment(start=s, end=e if e is not None else float("inf")))
    return silences


def keep_segments(
    total: float,
    silences: list[Segment],
    pad: float = 0.08,
    min_keep: float = 0.15,
) -> list[Segment]:
    """무음의 여집합(발화 구간)을 계산한다.

    Args:
        total: 영상 전체 길이(초).
        pad: 각 발화 구간 앞뒤로 남길 여유(초). 컷이 숨소리까지 잘라먹지 않게 함.
        min_keep: 이보다 짧은 발화 조각은 버린다(초).
    """
    silences = sorted(silences, key=lambda s: s.start)
    keeps: list[Segment] = []
    cursor = 0.0
    for sil in silences:
        sil_end = min(sil.end, total)
        if sil.start > cursor:
            keeps.append(Segment(cursor, min(sil.start, total)))
        cursor = max(cursor, sil_end)
    if cursor < total:
        keeps.append(Segment(cursor, total))

    # padding 적용 + 경계 클램프
    padded: list[Segment] = []
    for k in keeps:
        s = max(0.0, k.start - pad)
        e = min(total, k.end + pad)
        if e - s >= min_keep:
            padded.append(Segment(s, e))

    # padding 으로 겹친 인접 구간 병합
    merged: list[Segment] = []
    for k in padded:
        if merged and k.start <= merged[-1].end:
            merged[-1] = Segment(merged[-1].start, max(merged[-1].end, k.end))
        else:
            merged.append(k)
    return merged
