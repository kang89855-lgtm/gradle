# 캡컷 에이전트 (CapCut Agent)

한국어 토킹 영상 자동 편집기. 입력 `mp4/mov` → 출력 **캡컷 드래프트**
(무음·잔말·NG 컷 + 자막). 로컬 웹(FastAPI + 정적 HTML 1장)으로 감싼다.

> **핵심 원칙**
> - 전체 대본(script)을 먼저 추출 → 그걸로 NG/자막을 결정 (단어 단위 X)
> - **검증 = 사용자가 캡컷에서 직접 재생.** 빌드 성공 ≠ 검증.
> - 단계별로 적층하며, 각 단계를 캡컷에서 재생 확인한 뒤 다음 단계로.

이 프로젝트는 gradle 저장소 코드와 무관한 자체 완결형 하위 프로젝트다
(`capcut-agent/`).

---

## 대상 환경

| 트랙 | 조건 | ASR 백엔드 |
|---|---|---|
| **A** | macOS + Apple Silicon(arm64) | `mlx-whisper` |
| C | Windows AMD64 | `faster-whisper` (+MP4 export 보너스) |
| fallback | Intel Mac / 기타 | `faster-whisper` |

현재 개발/검증 타깃: **트랙 A (Mac M칩)**.

---

## 빌드 적층 로드맵

| 단계 | 내용 | 상태 |
|---|---|---|
| **1** | `silence_detect` + `build_draft` → 점프컷 드래프트 (UI 없음) | ✅ 코드 완료, 로컬 캡컷 검증 대기 |
| 2 | FastAPI + 정적 HTML (drag/drop + SSE stepper) | ⏳ |
| 3 | whisper Transcript(세그먼트+단어) + 세그먼트 자막 | ⏳ |
| 4 | filler_ng + cuts (잔말/NG 통합 컷) | ⏳ |
| 5 | 영상 프리뷰 + 보존 구간 마킹 (`[` / `]` 단축키) | ⏳ |

---

## Stage 1 — 로컬 Mac 실행 & 검증

### 준비물
- `brew install ffmpeg` (silencedetect 에 필요; ffprobe 는 불필요)
- Python 3.11 (`brew install python@3.11`)
- **캡컷 설치 + 1회 실행** — 드래프트 폴더가 생성돼 있어야 함
  (`~/Movies/CapCut/User Data/Projects/com.lveditor.draft`)

### 설치
```bash
cd capcut-agent
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

### 실행
```bash
python scripts/stage1_jumpcut.py 내영상.mp4
# 옵션:
#   --name 드래프트이름     (기본: 파일명-jumpcut)
#   --noise -30            무음 임계 dB (더 조용해야 무음으로 치려면 -40)
#   --min-silence 0.5      최소 무음 길이(초)
#   --pad 0.08             발화 구간 앞뒤 여유(초) — 숨소리/어미 보호
#   --smooth 0.0           컷마다 크로스 디졸브(초). 음성 이음매 매끄럽게 / 편집 티 안 나게
#   --draft-root PATH      캡컷 드래프트 폴더 직접 지정 (CAPCUT_DRAFT_ROOT env 도 가능)
```

### "편집한 티 안 나게 / 음성 이질감 없게"
무음 지점에서 그냥 하드 컷을 내면 룸톤(배경음)이 튀어 편집 흔적이 드러난다.
`--smooth` 로 컷마다 짧은 크로스 디졸브(`叠化`)를 넣으면 영상 점프와 오디오
이음매가 동시에 부드러워진다:
```bash
python scripts/stage1_jumpcut.py 내영상.mp4 --pad 0.12 --min-silence 0.6 --smooth 0.1
```
- `--smooth 0.08~0.12` 권장 (너무 길면 말이 겹쳐 들림)
- 디졸브 길이는 인접 조각 길이의 40% 이내로 자동 클램프돼 짧은 조각에서 안 깨진다

### ★ 검증 (이게 진짜 검증이다)
1. **캡컷을 연다** → 방금 만든 드래프트(`파일명-jumpcut`)가 목록에 보이는지.
2. 열어서 **재생** → 무음이 자연스럽게 잘려 점프컷이 됐는지, 발화가 잘려나가지
   않았는지 귀로 확인.
3. 어색하면 파라미터 조정:
   - 컷이 발화를 먹으면 → `--pad` 늘리기(0.12), `--min-silence` 늘리기(0.7)
   - 무음이 안 잘리면 → `--noise` 올리기(-25), `--min-silence` 줄이기(0.35)

### ⚠️ 알려진 함정 — 최우선 확인
- **드래프트 파일명 포맷.** 이 코드는 `pycapcut==0.0.3`을 쓰며, 이 버전은
  `draft_content.json` + `draft_meta_info.json` 을 쓴다. 설치된 캡컷 버전이
  기대하는 포맷(`draft_info.json` 등)과 다르면 **드래프트가 목록에 안 뜨거나
  안 열릴 수 있다.** 이 경우:
  1. 캡컷 버전을 확인하고, pycapcut 버전을 그에 맞게 올리거나 내린다.
  2. 원래 참조하기로 한 `pycapcut-mac` 스킬(현재 이 세션엔 없음)의 포맷 가이드가
     필요할 수 있다.
- 오디오는 비디오 세그먼트에 포함된다(토킹 영상) — 별도 오디오 트랙 없음.

---

## 테스트 (ffmpeg 불필요)
```bash
python -m pytest tests/
```
`keep_segments`(무음 여집합 계산) 로직의 회귀 테스트.

---

## 구조
```
capcut-agent/
├── capcut_agent/
│   ├── config.py         # OS/트랙 감지 + 캡컷 드래프트 폴더 탐지
│   ├── silence.py        # ffmpeg silencedetect → 보존 세그먼트 (pymediainfo probe)
│   └── draft_builder.py  # 보존 세그먼트 → pycapcut 점프컷 드래프트
├── scripts/
│   └── stage1_jumpcut.py # Stage 1 CLI
├── tests/
│   └── test_silence.py
└── requirements.txt
```
