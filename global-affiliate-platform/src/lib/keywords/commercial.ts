// Commercial keyword generator:
// Country + City + Traveler Type + Product + Commercial Modifier + Season.
// Long-tail purchase-intent phrases beat high-volume informational terms.

export interface KeywordParts {
  country?: string;
  city: string;
  travelerType?: string; // "가족", "honeymoon", ...
  product: string; // "메콩강 투어", "airport pickup", ...
  modifier: string; // "가격 예약", "price and booking", ...
  season?: string; // "12월", "December", ...
}

export function buildCommercialKeyword(parts: KeywordParts): string {
  return [
    parts.country,
    parts.city,
    parts.travelerType,
    parts.product,
    parts.modifier,
    parts.season,
  ]
    .filter((p): p is string => Boolean(p && p.trim()))
    .map((p) => p.trim())
    .join(" ");
}

/** Commercial modifiers worth targeting (used by the keyword discovery job). */
export const COMMERCIAL_MODIFIERS = {
  ko: [
    "가격",
    "예약",
    "할인",
    "비교",
    "무료 취소",
    "공항 픽업",
    "가족 호텔",
    "한 달 살기",
    "한국어 가이드",
  ],
  en: [
    "price",
    "booking",
    "reservation",
    "discount",
    "comparison",
    "free cancellation",
    "airport pickup",
    "family hotel",
    "monthly stay",
    "Korean-speaking guide",
  ],
} as const;

/** Informational patterns to deprioritize — they attract traffic that never books. */
export const LOW_INTENT_PATTERNS = [
  "역사",
  "문화",
  "사진",
  "유명한 이유",
  "history",
  "culture",
  "photos",
] as const;

export function isLowIntent(keyword: string): boolean {
  const lower = keyword.toLowerCase();
  return LOW_INTENT_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
}
