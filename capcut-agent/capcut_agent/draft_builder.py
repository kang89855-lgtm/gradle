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


def build_jumpcut_draft(
    input_path: str,
    keeps: list[Segment],
    probe: Probe,
    draft_name: str,
    draft_root: str | None = None,
    allow_replace: bool = True,
) -> Path:
    """점프컷 드래프트를 캡컷 폴더에 생성하고 드래프트 경로를 반환한다."""
    if not keeps:
        raise ValueError("보존할 발화 구간이 없습니다. 무음 임계값을 확인하세요.")

    root = find_draft_root(draft_root)
    folder = cc.DraftFolder(str(root))
    script = folder.create_draft(
        draft_name, probe.width, probe.height, fps=probe.fps, allow_replace=allow_replace
    )
    script.add_track(cc.TrackType.video)

    material = cc.VideoMaterial(input_path)

    cursor = 0  # 타임라인 상 현재 위치(마이크로초)
    for k in keeps:
        dur = _us(k.duration)
        if dur <= 0:
            continue
        seg = cc.VideoSegment(
            material,
            target_timerange=cc.trange(cursor, dur),
            source_timerange=cc.trange(_us(k.start), dur),
        )
        script.add_segment(seg)
        cursor += dur

    script.save()
    return root / draft_name
