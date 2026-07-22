#!/usr/bin/env python3
"""Stage 1 CLI — 무음 컷 점프컷 드래프트.

    python scripts/stage1_jumpcut.py 입력.mp4 [--name 드래프트이름]
        [--noise -30] [--min-silence 0.5] [--pad 0.08] [--draft-root PATH]

출력: 캡컷 드래프트 폴더에 점프컷 드래프트 1개.
검증: 캡컷을 열어 해당 드래프트를 재생. 빌드 성공 ≠ 검증.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# capcut_agent 패키지를 import 경로에 추가
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from capcut_agent import silence, draft_builder  # noqa: E402
from capcut_agent.config import detect_env  # noqa: E402


def _fmt(sec: float) -> str:
    m, s = divmod(sec, 60)
    return f"{int(m):02d}:{s:05.2f}"


def main() -> int:
    ap = argparse.ArgumentParser(description="무음 컷 점프컷 드래프트 (Stage 1)")
    ap.add_argument("input", help="입력 mp4/mov 경로")
    ap.add_argument("--name", default=None, help="드래프트 이름 (기본: 파일명-jumpcut)")
    ap.add_argument("--noise", type=float, default=-30.0, help="무음 임계 dB (기본 -30)")
    ap.add_argument("--min-silence", type=float, default=0.5, help="최소 무음 길이 초 (기본 0.5)")
    ap.add_argument("--pad", type=float, default=0.08, help="발화 구간 앞뒤 여유 초 (기본 0.08)")
    ap.add_argument("--smooth", type=float, default=0.0,
                    help="컷마다 넣을 크로스 디졸브 길이 초 (기본 0=하드컷). "
                         "음성 이음매를 매끄럽게/편집 티 안 나게: 0.08~0.12 권장")
    ap.add_argument("--draft-root", default=None, help="캡컷 드래프트 폴더 직접 지정")
    args = ap.parse_args()

    inp = Path(args.input).expanduser()
    if not inp.is_file():
        print(f"[에러] 입력 파일이 없습니다: {inp}", file=sys.stderr)
        return 2

    env = detect_env()
    print(f"[env] {env.system} {env.machine} → 트랙 {env.track} (ASR: {env.asr_backend})")
    print(f"[1/3] probe: {inp.name}")
    pr = silence.probe(str(inp))
    print(f"      {pr.width}x{pr.height} @ {pr.fps}fps, 길이 {_fmt(pr.duration)}")

    print(f"[2/3] silencedetect: noise={args.noise}dB, min={args.min_silence}s")
    sils = silence.detect_silence(str(inp), noise_db=args.noise, min_silence=args.min_silence)
    keeps = silence.keep_segments(pr.duration, sils, pad=args.pad)
    kept = sum(k.duration for k in keeps)
    saved = pr.duration - kept
    print(f"      무음 {len(sils)}개 검출 → 보존 조각 {len(keeps)}개")
    print(f"      최종 길이 {_fmt(kept)}  (원본 {_fmt(pr.duration)}, {saved:.1f}s / "
          f"{saved / pr.duration * 100 if pr.duration else 0:.0f}% 컷)")

    name = args.name or f"{inp.stem}-jumpcut"
    smooth_msg = f", smooth 디졸브 {args.smooth}s" if args.smooth > 0 else " (하드컷)"
    print(f"[3/3] build_draft: '{name}'{smooth_msg}")
    path = draft_builder.build_jumpcut_draft(
        str(inp), keeps, pr, draft_name=name, draft_root=args.draft_root, smooth=args.smooth
    )
    print(f"\n✓ 드래프트 생성: {path}")
    print("→ 검증: 캡컷을 열고 이 드래프트를 재생해 컷 지점을 확인하세요. (빌드 성공 ≠ 검증)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
