# Global Affiliate Platform

대전(대한민국)에서 총괄 운영하는 다국가 여행 어필리에이트 수익 플랫폼.
Phase 1 대상 국가: **베트남 · 말레이시아 · 필리핀** (확장: 인도네시아 · 우즈베키스탄 · 조지아 — 설정만 등록, 비활성).

## 기술 스택

- Next.js 15 (App Router) + TypeScript (strict)
- PostgreSQL + Prisma ORM
- Tailwind CSS v4
- Vitest

## 시작하기

```bash
cd global-affiliate-platform
npm install
cp .env.example .env        # 값 채우기 — 실제 자격증명은 절대 커밋 금지
npm run prisma:generate

# DB가 준비된 경우
npm run prisma:migrate      # 마이그레이션 생성·적용
npm run prisma:seed         # 국가·도시·제휴사·상품 시드

npm run dev                 # http://localhost:3000
```

DB 없이도 공개 페이지는 정적 설정으로 동작합니다(클릭 로그만 생략됨).

## 검증

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest
npm run build       # production build
```

## 구조

```
prisma/schema.prisma        # 20개 엔티티: Country…DistributionJob
prisma/seed.ts              # VN/MY/PH + 확장 3국 시드
src/config/countries/       # 국가 전략 설정 (모듈형, phase·enabled 플래그)
src/config/offers.ts        # Phase-1 정적 상품 카탈로그 (제휴사 자체 랜딩페이지만 링크)
src/lib/market/priority.ts     # 국가 우선순위 (25/20/15/20/15/5 가중치)
src/lib/market/opportunity.ts  # Profit Opportunity Score 0–100 + BUILD_NOW/VALIDATE/WATCH/REJECT
src/lib/affiliate/adapters/    # booking·agoda·klook·getyourguide 수동 딥링크 어댑터
src/lib/affiliate/router.ts    # 다중 제휴사 노출 순서 결정 (단일 제휴사 비종속)
src/lib/affiliate/offerScore.ts# 확정수익 기반 상품 점수 (전환율·취소율 반영)
src/lib/content/workflow.ts    # DISCOVERED→…→PUBLISHED 상태기계 (검수 없이 발행 불가)
src/lib/keywords/commercial.ts # 구매 의도형 키워드 생성기
src/lib/pipeline/              # 실행 스케줄 + 확대/수정/교체/중단 판정
src/lib/currency/exchange.ts   # KRW 기준 환율 변환 (USD·현지통화 병기)
src/lib/compliance/            # 언어별 제휴 고지 (첫 링크 이전 필수 노출)
src/app/[locale]/[country]/[destination]/  # 다국어 여행지 페이지 (canonical·hreflang·JSON-LD)
src/app/go/[slug]/route.ts     # 서버측 딥링크 생성 + 클릭 추적 리다이렉트
src/app/admin/page.tsx         # 시장 우선순위 대시보드
```

## 원칙

- **자격증명은 환경변수로만.** 코드·DB에 절대 저장하지 않음 (`credentialEnvVar`는 변수명만 기록).
- **단일 제휴사 비종속.** 같은 상품에 복수 제휴사를 연결하고 라우터가 노출 순서를 결정.
- **스크래핑 금지.** API가 없는 제휴사는 문서화된 파라미터 기반 수동 딥링크만 사용.
- **가격 정확성.** 보장 불가한 가격은 표시하지 않음. 정적 카탈로그는 제휴사 검색 페이지로 연결.
- **AI 콘텐츠 자동 발행 금지.** FACT_CHECKED·HUMAN_REVIEWED 상태를 거치지 않으면 발행 전이 자체가 불가능.
- **개인정보 최소화.** 클릭 로그는 솔티드 해시만 저장, 원본 IP·UA 미보관. `/go/`·`/admin`은 robots 차단.

## 환경 분리

`.env.development` / `.env.staging` / `.env.production`을 각각 관리하고 `APP_ENV`로 구분합니다. 예시는 `.env.example` 참고.

## 다음 단계 (Phase 2+)

1. 관리자 인증 + 키워드·상품 CRUD
2. KeywordMetric 수집 잡 (검색량·경쟁도·CPC — API/CSV 임포트만)
3. 환율 동기화·깨진 링크 감지 daily 잡 (`src/lib/pipeline/schedule.ts` 참조)
4. 콘텐츠 브리프 생성 + 검수 큐 UI
5. 전환·확정수익 임포트 및 EPC/RPM/Content ROI 대시보드
6. 현지 업체 직접 제휴 CRM
