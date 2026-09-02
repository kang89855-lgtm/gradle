"""keep_segments 회귀 테스트 (ffmpeg 불필요, 순수 로직).

    pytest capcut-agent/tests/   또는   python -m pytest
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from capcut_agent.silence import Segment, keep_segments


def _tuples(segs):
    return [(round(s.start, 2), round(s.end, 2)) for s in segs]


def test_basic_complement():
    sils = [Segment(2, 3), Segment(6, 7.5)]
    assert _tuples(keep_segments(10.0, sils, pad=0.0, min_keep=0.1)) == [(0, 2), (3, 6), (7.5, 10)]


def test_padding_no_overlap():
    sils = [Segment(2, 3), Segment(6, 7.5)]
    assert _tuples(keep_segments(10.0, sils, pad=0.1, min_keep=0.1)) == [(0, 2.1), (2.9, 6.1), (7.4, 10)]


def test_padding_merges_short_silence():
    sils = [Segment(2, 2.2)]
    assert _tuples(keep_segments(5.0, sils, pad=0.3, min_keep=0.1)) == [(0, 5)]


def test_tail_silence_to_infinity():
    sils = [Segment(8, float("inf"))]
    assert _tuples(keep_segments(10.0, sils, pad=0.0, min_keep=0.1)) == [(0, 8)]


def test_min_keep_drops_tiny_fragment():
    sils = [Segment(0.05, 9)]
    assert _tuples(keep_segments(10.0, sils, pad=0.0, min_keep=0.15)) == [(9, 10)]


def test_no_silence_keeps_whole():
    assert _tuples(keep_segments(10.0, [], pad=0.0, min_keep=0.1)) == [(0, 10)]
