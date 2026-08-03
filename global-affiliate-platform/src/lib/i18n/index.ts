export const SUPPORTED_LOCALES = ["ko", "en"] as const; // phase 1
export const PLANNED_LOCALES = ["vi", "ms", "id", "tl"] as const; // phase 2

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ko";

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

type Dictionary = {
  siteName: string;
  tagline: string;
  countries: string;
  destinations: string;
  offers: string;
  bookNow: string;
  freeCancellation: string;
  approxPrice: string;
  disclosureTitle: string;
  disclosureBody: string;
  adminDashboard: string;
  marketPriority: string;
  targetCities: string;
  whyThisCity: string;
  noOffers: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ko: {
    siteName: "글로벌 트래블 딜",
    tagline: "경쟁이 적은 도시, 예약 가능한 상품만 골라 소개합니다",
    countries: "국가",
    destinations: "여행지",
    offers: "예약 가능한 상품",
    bookNow: "예약하러 가기",
    freeCancellation: "무료 취소 가능",
    approxPrice: "약",
    disclosureTitle: "제휴 안내",
    disclosureBody:
      "이 페이지의 링크로 예약하시면 당사가 제휴 수수료를 받을 수 있습니다. 추가 비용은 발생하지 않으며, 표시 가격은 예약 시점에 따라 달라질 수 있습니다.",
    adminDashboard: "관리자 대시보드",
    marketPriority: "시장 우선순위",
    targetCities: "공략 도시",
    whyThisCity: "선정 이유",
    noOffers: "현재 예약 가능한 상품을 준비 중입니다.",
  },
  en: {
    siteName: "Global Travel Deals",
    tagline: "Underserved destinations, bookable products only",
    countries: "Countries",
    destinations: "Destinations",
    offers: "Bookable offers",
    bookNow: "Book now",
    freeCancellation: "Free cancellation",
    approxPrice: "approx.",
    disclosureTitle: "Affiliate disclosure",
    disclosureBody:
      "If you book through links on this page we may earn an affiliate commission at no extra cost to you. Displayed prices are indicative and may change at booking time.",
    adminDashboard: "Admin dashboard",
    marketPriority: "Market priority",
    targetCities: "Target cities",
    whyThisCity: "Why this city",
    noOffers: "Bookable offers for this destination are being prepared.",
  },
};

export function getDictionary(locale: string): Dictionary {
  return dictionaries[isSupportedLocale(locale) ? locale : DEFAULT_LOCALE];
}
