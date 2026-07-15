"""OS 감지 + 캡컷 드래프트 폴더 탐지.

트랙 판정 (Step 0):
    Darwin arm64      → 트랙 A (mlx-whisper)
    Windows AMD64     → 트랙 C (faster-whisper, MP4 export 보너스)
    그 외             → fallback (faster-whisper)
"""

from __future__ import annotations

import os
import platform
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Env:
    system: str          # "Darwin" | "Windows" | "Linux" | ...
    machine: str         # "arm64" | "AMD64" | "x86_64" | ...
    track: str           # "A" | "C" | "fallback"
    asr_backend: str     # "mlx-whisper" | "faster-whisper"

    @property
    def is_mac_arm(self) -> bool:
        return self.system == "Darwin" and self.machine == "arm64"


def detect_env() -> Env:
    system = platform.system()
    machine = platform.machine()
    if system == "Darwin" and machine == "arm64":
        return Env(system, machine, "A", "mlx-whisper")
    if system == "Windows" and machine in ("AMD64", "x86_64"):
        return Env(system, machine, "C", "faster-whisper")
    return Env(system, machine, "fallback", "faster-whisper")


# CapCut 국제판 드래프트 폴더 (플랫폼별 기본 경로).
# 존재하지 않으면 캡컷을 설치하고 1회 실행해 폴더를 생성해야 합니다.
_DRAFT_CANDIDATES = {
    "Darwin": [
        "~/Movies/CapCut/User Data/Projects/com.lveditor.draft",
    ],
    "Windows": [
        "~/AppData/Local/CapCut/User Data/Projects/com.lveditor.draft",
    ],
}


def find_draft_root(override: str | None = None) -> Path:
    """캡컷 드래프트 루트 폴더를 반환. 없으면 FileNotFoundError.

    Args:
        override: 환경변수 CAPCUT_DRAFT_ROOT 또는 인자로 직접 지정 가능.
    """
    override = override or os.environ.get("CAPCUT_DRAFT_ROOT")
    if override:
        p = Path(override).expanduser()
        if not p.is_dir():
            raise FileNotFoundError(f"지정한 드래프트 폴더가 없습니다: {p}")
        return p

    system = platform.system()
    for cand in _DRAFT_CANDIDATES.get(system, []):
        p = Path(cand).expanduser()
        if p.is_dir():
            return p

    tried = _DRAFT_CANDIDATES.get(system, [])
    raise FileNotFoundError(
        "캡컷 드래프트 폴더를 찾지 못했습니다.\n"
        f"  플랫폼: {system}\n"
        f"  확인한 경로: {tried or '(이 플랫폼 기본 경로 없음)'}\n"
        "→ 캡컷을 설치하고 1회 실행한 뒤 다시 시도하거나,\n"
        "  CAPCUT_DRAFT_ROOT 환경변수로 폴더를 직접 지정하세요."
    )
