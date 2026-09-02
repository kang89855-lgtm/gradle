"""보존 세그먼트 리스트 → 캡컷 점프컷 드래프트 생성.

pycapcut(=pyCapCut) 로 draft_info.json 을 직접 쓴다. 시간 단위는 마이크로초.
발화 구간마다 원본의 해당 부분을 잘라(source_timerange) 타임라인에 순서대로
이어붙인다(target_timerange). 무음 구간은 자연히 사라져 점프컷이 된다.

토킹 영상이므로 오디오는 비디오 세그먼트에 포함된다 — 별도 오디오 트랙 불필요.
"""

from __future__ import annotations

from pathlib import Path

import pycapcut as cc

from .config import find_draft_root
from .silence import Segment, Probe

SEC = 1_000_000  # 마이크로초/초


def _us(seconds: float) -> int:
    return int(round(seconds * SEC))


# 가장 눈에 안 띄는 크로스 디졸브(叠化). 컷 지점의 룸톤 튐/클릭을 부드럽게 덮어
# "편집한 티"를 줄인다. 영상 점프와 오디오 이음매를 동시에 완화.
_SMOOTH_TRANSITION = "叠化"


def build_jumpcut_draft(
    input_path: str,
    keeps: list[Segment],
    probe: Probe,
    draft_name: str,
    draft_root: str | None = None,
    allow_replace: bool = True,
    smooth: float = 0.0,
) -> Path:
    """점프컷 드래프트를 캡컷 폴더에 생성하고 드래프트 경로를 반환한다.

    Args:
        smooth: >0 이면 컷마다 이 길이(초)의 크로스 디졸브를 넣어 이음매를
            매끄럽게 한다. 각 인접 조각 길이의 40%로 자동 클램프해 짧은 조각에서
            깨지지 않게 한다. 0 이면 하드 점프컷.
    """
    if not keeps:
        raise ValueError("보존할 발화 구간이 없습니다. 무음 임계값을 확인하세요.")

    root = find_draft_root(draft_root)
    folder = cc.DraftFolder(str(root))
    script = folder.create_draft(
        draft_name, probe.width, probe.height, fps=probe.fps, allow_replace=allow_replace
    )
    script.add_track(cc.TrackType.video)

    material = cc.VideoMaterial(input_path)
    transition = getattr(cc.TransitionType, _SMOOTH_TRANSITION) if smooth > 0 else None

    valid = [k for k in keeps if _us(k.duration) > 0]
    cursor = 0  # 타임라인 상 현재 위치(마이크로초)
    for i, k in enumerate(valid):
        dur = _us(k.duration)
        seg = cc.VideoSegment(
            material,
            target_timerange=cc.trange(cursor, dur),
            source_timerange=cc.trange(_us(k.start), dur),
        )
        # 트랜지션은 "앞" 세그먼트에 붙인다 → 마지막 조각 제외.
        if transition is not None and i < len(valid) - 1:
            nxt = valid[i + 1]
            # 인접 두 조각 길이의 40% 이내로 클램프(둘 중 짧은 쪽 기준).
            max_dur = 0.4 * min(k.duration, nxt.duration)
            tdur = _us(min(smooth, max_dur))
            if tdur > 0:
                seg.add_transition(transition, duration=tdur)
        script.add_segment(seg)
        cursor += dur

    script.save()
    return root / draft_name
