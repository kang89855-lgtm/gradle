#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""캡컷 에이전트 — 단일 파일 로컬 실행판 (Windows/Mac 공용).

음성은 그대로 두고, 무음 구간을 잘라 영상을 매끄럽게 편집한 CapCut 드래프트를
만든다. 파일 하나만 있으면 되고, 폴더를 주면 안에서 영상을 자동으로 찾는다.

사용법 (Windows PowerShell):
    python capcut_local.py "C:\\Users\\user\\Downloads\\캡컷"
    python capcut_local.py "C:\\...\\내영상.mp4" --smooth 0.1

필요한 것:
    1) Python 3.9+  2) ffmpeg (PATH)  3) pip install pyCapCut
    4) CapCut 설치 + 1회 실행(드래프트 폴더 생성)

검증 = CapCut 에서 드래프트를 직접 재생. 빌드 성공 ≠ 검증.
"""

from __future__ import annotations

import argparse
import os
import platform
import re
import shutil
import subprocess
import sys
from pathlib import Path

SEC = 1_000_000  # 마이크로초/초
VIDEO_EXTS = {".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi"}
_SMOOTH_TRANSITION = "叠化"  # 가장 눈에 안 띄는 크로스 디졸브


# ────────────────────────────── 환경/경로 ──────────────────────────────
def find_draft_root(override: str | None) -> Path:
    override = override or os.environ.get("CAPCUT_DRAFT_ROOT")
    if override:
        p = Path(override).expanduser()
        if not p.is_dir():
            sys.exit(f"[에러] 지정한 드래프트 폴더가 없습니다: {p}")
        return p

    system = platform.system()
    cands = {
        "Windows": [os.path.expandvars(r"%LOCALAPPDATA%\CapCut\User Data\Projects\com.lveditor.draft")],
        "Darwin": ["~/Movies/CapCut/User Data/Projects/com.lveditor.draft"],
    }.get(system, [])
    for c in cands:
        p = Path(c).expanduser()
        if p.is_dir():
            return p
    sys.exit(
        "[에러] 캡컷 드래프트 폴더를 찾지 못했습니다.\n"
        f"  플랫폼: {system}\n"
        f"  확인 경로: {cands or '(기본 경로 없음)'}\n"
        "→ 캡컷을 설치하고 '한 번 실행'한 뒤 다시 시도하거나,\n"
        "  --draft-root 로 폴더를 직접 지정하세요."
    )


def resolve_input(path_str: str) -> Path:
    """파일이면 그대로, 폴더면 안에서 영상을 찾아 반환한다."""
    p = Path(path_str).expanduser()
    if p.is_file():
        return p
    if p.is_dir():
        vids = sorted(
            [f for f in p.iterdir() if f.is_file() and f.suffix.lower() in VIDEO_EXTS],
            key=lambda f: f.stat().st_mtime,
            reverse=True,
        )
        if not vids:
            sys.exit(f"[에러] 폴더에 영상 파일이 없습니다: {p}\n  (지원: {', '.join(sorted(VIDEO_EXTS))})")
        if len(vids) == 1:
            print(f"[입력] 폴더에서 영상 1개 발견 → {vids[0].name}")
            return vids[0]
        print(f"[입력] 폴더에 영상이 여러 개 있습니다 ({len(vids)}개). 가장 최근 파일을 씁니다:")
        for i, v in enumerate(vids):
            mark = "→" if i == 0 else " "
            print(f"   {mark} {v.name}")
        print("   (다른 파일을 쓰려면 그 파일 경로를 직접 지정하세요)")
        return vids[0]
    sys.exit(f"[에러] 경로가 없습니다: {p}")


def require(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        sys.exit(
            f"[에러] '{tool}' 를 찾을 수 없습니다.\n"
            "  Windows: winget install Gyan.FFmpeg  (설치 후 터미널 새로 열기)\n"
            "  Mac:     brew install ffmpeg"
        )
    return path


# ────────────────────────────── 프로브/무음 ──────────────────────────────
class Probe:
    def __init__(self, duration: float, width: int, height: int, fps: int):
        self.duration, self.width, self.height, self.fps = duration, width, height, fps


def probe(input_path: str) -> Probe:
    """길이·해상도·fps 를 읽는다. pymediainfo(우선) → ffprobe(대체)."""
    try:
        from pymediainfo import MediaInfo

        info = MediaInfo.parse(input_path)
        v = next((t for t in info.tracks if t.track_type == "Video"), None)
        if v is None:
            sys.exit(f"[에러] 비디오 트랙을 찾지 못했습니다: {input_path}")
        width, height = int(v.width or 0), int(v.height or 0)
        dur_ms = v.duration or next(
            (t.duration for t in info.tracks if t.track_type == "General"), None
        )
        duration = float(dur_ms) / 1000.0 if dur_ms else 0.0
        fps = round(float(v.frame_rate)) if v.frame_rate else 30
    except Exception:
        # pymediainfo 실패 시 ffprobe 로 대체
        ffprobe = shutil.which("ffprobe")
        if not ffprobe:
            raise
        import json

        out = subprocess.run(
            [ffprobe, "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=width,height,avg_frame_rate:format=duration",
             "-of", "json", input_path],
            capture_output=True, text=True, check=True,
        ).stdout
        d = json.loads(out)
        s = (d.get("streams") or [{}])[0]
        width, height = int(s.get("width") or 0), int(s.get("height") or 0)
        duration = float((d.get("format") or {}).get("duration") or 0.0)
        try:
            num, den = (s.get("avg_frame_rate") or "30/1").split("/")
            fps = round(float(num) / float(den)) if float(den) else 30
        except Exception:
            fps = 30
    if width == 0 or height == 0 or duration == 0.0:
        sys.exit(f"[에러] 영상 메타데이터를 읽지 못했습니다: {input_path}")
    return Probe(duration, width, height, fps or 30)


_SIL_START = re.compile(r"silence_start:\s*([0-9.]+)")
_SIL_END = re.compile(r"silence_end:\s*([0-9.]+)")


def detect_silence(input_path: str, noise_db: float, min_silence: float):
    ffmpeg = require("ffmpeg")
    log = subprocess.run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", input_path,
         "-af", f"silencedetect=noise={noise_db}dB:d={min_silence}", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    starts = [float(x) for x in _SIL_START.findall(log)]
    ends = [float(x) for x in _SIL_END.findall(log)]
    out = []
    for i, s in enumerate(starts):
        out.append((s, ends[i] if i < len(ends) else float("inf")))
    return out


_MEAN_VOL = re.compile(r"mean_volume:\s*(-?[0-9.]+)\s*dB")
_MAX_VOL = re.compile(r"max_volume:\s*(-?[0-9.]+)\s*dB")


def measure_loudness(input_path: str):
    """ffmpeg volumedetect 로 (mean_dB, max_dB) 를 잰다. 오디오 없으면 None."""
    ffmpeg = require("ffmpeg")
    log = subprocess.run(
        [ffmpeg, "-hide_banner", "-nostats", "-i", input_path, "-af", "volumedetect", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m, x = _MEAN_VOL.search(log), _MAX_VOL.search(log)
    if not m:
        return None
    return float(m.group(1)), float(x.group(1)) if x else 0.0


def compute_volumes(loudness):
    """클립별 (mean,max) 리스트 → 음량을 맞추는 volume 배수 리스트.

    중앙값을 목표로: 큰 클립은 줄이고(안전), 작은 클립은 키우되 피크가 -1dBFS 를
    넘지 않게 헤드룸 내에서만 키운다. 결과적으로 음량이 고르게 된다.
    """
    means = [ld[0] for ld in loudness if ld is not None]
    if not means:
        return [1.0] * len(loudness)
    srt = sorted(means)
    target = srt[len(srt) // 2]  # 중앙값(dB)
    vols = []
    for ld in loudness:
        if ld is None:
            vols.append(1.0)
            continue
        mean_db, max_db = ld
        gain = target - mean_db
        if gain > 0:  # 키우는 경우: 피크가 -1dBFS 넘지 않게 제한
            gain = min(gain, max(0.0, -1.0 - max_db))
        vol = 10 ** (gain / 20.0)
        vols.append(max(0.1, min(4.0, vol)))
    return vols


def keep_segments(total: float, silences, pad: float, min_keep: float):
    silences = sorted(silences)
    keeps, cursor = [], 0.0
    for s, e in silences:
        e = min(e, total)
        if s > cursor:
            keeps.append((cursor, min(s, total)))
        cursor = max(cursor, e)
    if cursor < total:
        keeps.append((cursor, total))
    padded = []
    for s, e in keeps:
        s2, e2 = max(0.0, s - pad), min(total, e + pad)
        if e2 - s2 >= min_keep:
            padded.append((s2, e2))
    merged = []
    for s, e in padded:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


# ────────────────────────────── 드래프트 빌드 ──────────────────────────────
def _us(sec: float) -> int:
    return int(round(sec * SEC))


def _import_cc():
    try:
        import pycapcut as cc
        return cc
    except ImportError:
        sys.exit("[에러] pyCapCut 가 설치돼 있지 않습니다.  →  pip install pyCapCut")


def _add_segments(script, cc, material, keeps, cursor, transition, smooth, is_last_clip, volume=1.0):
    """한 클립의 보존 구간들을 타임라인에 순서대로 얹는다. 다음 cursor 를 반환."""
    valid = [(s, e) for (s, e) in keeps if _us(e - s) > 0]
    for i, (s, e) in enumerate(valid):
        dur = _us(e - s)
        seg = cc.VideoSegment(
            material,
            target_timerange=cc.trange(cursor, dur),
            source_timerange=cc.trange(_us(s), dur),
            volume=volume,
        )
        # 전체(모든 클립 통틀어) 마지막 조각에는 트랜지션을 붙이지 않는다.
        last_overall = is_last_clip and i == len(valid) - 1
        if transition is not None and not last_overall:
            nxt = valid[i + 1] if i + 1 < len(valid) else None
            nlen = (nxt[1] - nxt[0]) if nxt else (e - s)
            max_dur = 0.4 * min(e - s, nlen)
            tdur = _us(min(smooth, max_dur))
            if tdur > 0:
                seg.add_transition(transition, duration=tdur)
        script.add_segment(seg)
        cursor += dur
    return cursor


def build_draft(input_path: str, keeps, pr: Probe, name: str, draft_root: str | None, smooth: float):
    cc = _import_cc()
    if not keeps:
        sys.exit("[에러] 보존할 발화 구간이 없습니다. 무음 임계값(--noise/--min-silence)을 조정하세요.")
    root = find_draft_root(draft_root)
    folder = cc.DraftFolder(str(root))
    script = folder.create_draft(name, pr.width, pr.height, fps=pr.fps, allow_replace=True)
    script.add_track(cc.TrackType.video)
    material = cc.VideoMaterial(input_path)
    transition = getattr(cc.TransitionType, _SMOOTH_TRANSITION) if smooth > 0 else None
    _add_segments(script, cc, material, keeps, 0, transition, smooth, is_last_clip=True)
    script.save()
    return root / name


def build_combined_draft(clips, name, draft_root, smooth, noise, min_silence, pad, cut_silence, normalize):
    """여러 클립을 순서대로 이어붙여 하나의 긴 드래프트로 만든다.

    clips: [(Path, Probe), ...] 순서대로. cut_silence=False 면 각 클립을 통째로
    (최대한 길게) 넣고, True 면 클립마다 무음을 잘라 넣는다. normalize=True 면
    클립마다 음량을 재서 고르게 맞춘다. 클립 사이·조각 사이는 디졸브로 잇는다.
    """
    cc = _import_cc()
    first = clips[0][1]
    root = find_draft_root(draft_root)
    folder = cc.DraftFolder(str(root))
    script = folder.create_draft(name, first.width, first.height, fps=first.fps, allow_replace=True)
    script.add_track(cc.TrackType.video)
    transition = getattr(cc.TransitionType, _SMOOTH_TRANSITION) if smooth > 0 else None

    if normalize:
        print("      음량 측정 중...")
        loud = [measure_loudness(str(p)) for p, _ in clips]
        volumes = compute_volumes(loud)
    else:
        volumes = [1.0] * len(clips)

    cursor = 0
    total_kept = 0.0
    for idx, (path, pr) in enumerate(clips):
        material = cc.VideoMaterial(str(path))
        if cut_silence:
            sils = detect_silence(str(path), noise, min_silence)
            keeps = keep_segments(pr.duration, sils, pad, min_keep=0.15)
        else:
            keeps = [(0.0, pr.duration)]
        if not keeps:
            keeps = [(0.0, pr.duration)]
        total_kept += sum(e - s for s, e in keeps)
        cursor = _add_segments(
            script, cc, material, keeps, cursor, transition, smooth,
            is_last_clip=(idx == len(clips) - 1), volume=volumes[idx],
        )
        vtag = f"  vol×{volumes[idx]:.2f}" if normalize else ""
        print(f"      + [{idx + 1}/{len(clips)}] {path.name}  (누적 {_fmt(cursor / SEC)}){vtag}")
    script.save()
    return root / name, total_kept


# ────────────────────────────── main ──────────────────────────────
def _fmt(sec: float) -> str:
    m, s = divmod(sec, 60)
    return f"{int(m):02d}:{s:05.2f}"


def list_videos(folder_str: str):
    """폴더 안 영상 파일을 이름순(시간순)으로 반환."""
    p = Path(folder_str).expanduser()
    if p.is_file():  # 파일을 줬으면 그 하나만
        return [p]
    if not p.is_dir():
        sys.exit(f"[에러] 폴더가 없습니다: {p}")
    vids = sorted(
        [f for f in p.iterdir() if f.is_file() and f.suffix.lower() in VIDEO_EXTS],
        key=lambda f: f.name,  # hf_YYYYMMDD_HHMMSS_... → 이름순 = 촬영순
    )
    if not vids:
        sys.exit(f"[에러] 폴더에 영상 파일이 없습니다: {p}")
    return vids


def _run_combine(args) -> int:
    paths = list_videos(args.input)
    print(f"[이어붙이기] 영상 {len(paths)}개를 순서대로 하나로 합칩니다"
          f"{' (무음 컷 포함)' if not args.no_cut else ' (통째로, 최대한 길게)'}:")
    clips = []
    for i, path in enumerate(paths):
        pr = probe(str(path))
        clips.append((path, pr))
        print(f"   {i + 1:2d}. {path.name}  ({pr.width}x{pr.height} @ {pr.fps}fps, {_fmt(pr.duration)})")

    name = args.name or f"{Path(args.input).name}-combined"
    smsg = f", 디졸브 {args.smooth}s" if args.smooth > 0 else ""
    print(f"[빌드] 드래프트 '{name}'{smsg} 생성 중...")
    path, kept = build_combined_draft(
        clips, name, args.draft_root, args.smooth,
        args.noise, args.min_silence, args.pad,
        cut_silence=not args.no_cut, normalize=not args.no_normalize,
    )
    total_src = sum(pr.duration for _, pr in clips)
    print(f"\n✓ 완료: {path}")
    print(f"  최종 길이 {_fmt(kept)}  (원본 합계 {_fmt(total_src)}, 클립 {len(clips)}개)")
    print("→ 캡컷을 열어 이 드래프트를 재생해 확인하세요. (음성 그대로)")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(
        description="음성 그대로, 무음 컷 + 매끄러운 캡컷 드래프트 (로컬 실행판)"
    )
    ap.add_argument("input", help="영상 파일 또는 영상이 든 폴더 경로")
    ap.add_argument("--name", default=None, help="드래프트 이름 (기본: 파일명-cut)")
    ap.add_argument("--noise", type=float, default=-30.0, help="무음 임계 dB (조용해야 무음: -40)")
    ap.add_argument("--min-silence", type=float, default=0.6, help="최소 무음 길이 초 (기본 0.6)")
    ap.add_argument("--pad", type=float, default=0.12, help="발화 앞뒤 여유 초 (기본 0.12)")
    ap.add_argument("--smooth", type=float, default=0.1,
                    help="컷마다 크로스 디졸브 초 (기본 0.1=매끄럽게, 0=하드컷)")
    ap.add_argument("--combine", action="store_true",
                    help="폴더 안 영상 전부를 순서대로 이어붙여 긴 영상 1개로")
    ap.add_argument("--no-cut", action="store_true",
                    help="--combine 시 무음도 안 자르고 통째로 이어붙임 (최대한 길게)")
    ap.add_argument("--no-normalize", action="store_true",
                    help="--combine 시 클립별 음량 자동 평준화를 끔 (기본은 켜짐)")
    ap.add_argument("--draft-root", default=None, help="캡컷 드래프트 폴더 직접 지정")
    args = ap.parse_args()

    print(f"[env] {platform.system()} {platform.machine()}")

    if args.combine:
        return _run_combine(args)

    inp = resolve_input(args.input)
    print(f"[1/3] 분석: {inp.name}")
    pr = probe(str(inp))
    print(f"      {pr.width}x{pr.height} @ {pr.fps}fps, 길이 {_fmt(pr.duration)}")

    print(f"[2/3] 무음 검출: noise={args.noise}dB, min={args.min_silence}s")
    sils = detect_silence(str(inp), args.noise, args.min_silence)
    keeps = keep_segments(pr.duration, sils, args.pad, min_keep=0.15)
    kept = sum(e - s for s, e in keeps)
    saved = pr.duration - kept
    pct = saved / pr.duration * 100 if pr.duration else 0
    print(f"      무음 {len(sils)}개 → 보존 {len(keeps)}조각, "
          f"최종 {_fmt(kept)} (원본 {_fmt(pr.duration)}, {saved:.1f}s / {pct:.0f}% 컷)")

    name = args.name or f"{inp.stem}-cut"
    smsg = f", 디졸브 {args.smooth}s" if args.smooth > 0 else " (하드컷)"
    print(f"[3/3] 드래프트 생성: '{name}'{smsg}")
    path = build_draft(str(inp), keeps, pr, name, args.draft_root, args.smooth)

    print(f"\n✓ 완료: {path}")
    print("→ 캡컷을 열어 이 드래프트를 재생해 확인하세요. (음성 그대로, 무음만 잘림)")
    print("  어색하면:  컷이 말 먹음 → --pad 0.18 / 무음 안 잘림 → --noise -25")
    return 0


if __name__ == "__main__":
    sys.exit(main())
