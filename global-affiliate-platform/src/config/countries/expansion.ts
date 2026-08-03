import type { CountryStrategy } from "./types";

// Phase 2 markets — registered but disabled until Phase 1 metrics justify entry.

export const indonesiaStrategy: CountryStrategy = {
  code: "ID",
  slug: "indonesia",
  name: "Indonesia",
  nameKo: "인도네시아",
  phase: 2,
  languages: ["ko", "en", "id"],
  currencies: ["KRW", "USD", "IDR"],
  localCurrency: "IDR",
  targetCities: [
    { slug: "malang", name: "Malang", nameKo: "말랑", rationale: "브로모 화산 거점, 한국어 경쟁 낮음" },
    { slug: "surabaya", name: "Surabaya", nameKo: "수라바야", rationale: "제2도시, 직항 보유" },
    { slug: "makassar", name: "Makassar", nameKo: "마카사르", rationale: "술라웨시 관문, 콘텐츠 공백" },
    { slug: "medan", name: "Medan", nameKo: "메단", rationale: "토바호 연계, 니치 시장" },
  ],
  primaryCategories: ["hotels", "local-tours", "airport-transfers", "esim"],
  affiliateNetworks: ["booking", "agoda", "klook", "getyourguide"],
  paymentMethods: ["international-card", "local-wallet"],
  marketScore: {
    tourismDemand: 8,
    digitalPaymentGrowth: 9,
    purchasingPower: 6,
    competitionOpportunity: 7,
    affiliateAvailability: 7,
  },
  enabled: false,
};

export const uzbekistanStrategy: CountryStrategy = {
  code: "UZ",
  slug: "uzbekistan",
  name: "Uzbekistan",
  nameKo: "우즈베키스탄",
  phase: 2,
  languages: ["ko", "en"],
  currencies: ["KRW", "USD", "UZS"],
  localCurrency: "UZS",
  targetCities: [
    { slug: "samarkand", name: "Samarkand", nameKo: "사마르칸트", rationale: "실크로드 핵심지, 한국어권 경쟁 적음" },
    { slug: "bukhara", name: "Bukhara", nameKo: "부하라", rationale: "역사 투어 니치" },
  ],
  primaryCategories: ["hotels", "local-tours", "esim", "travel-insurance"],
  affiliateNetworks: ["booking", "getyourguide"],
  paymentMethods: ["international-card"],
  marketScore: {
    tourismDemand: 6,
    digitalPaymentGrowth: 6,
    purchasingPower: 5,
    competitionOpportunity: 9,
    affiliateAvailability: 5,
  },
  enabled: false,
};

export const georgiaStrategy: CountryStrategy = {
  code: "GE",
  slug: "georgia",
  name: "Georgia",
  nameKo: "조지아",
  phase: 2,
  languages: ["ko", "en"],
  currencies: ["KRW", "USD", "GEL"],
  localCurrency: "GEL",
  targetCities: [
    { slug: "kutaisi", name: "Kutaisi", nameKo: "쿠타이시", rationale: "저비용항공 허브, 콘텐츠 공백" },
    { slug: "batumi", name: "Batumi", nameKo: "바투미", rationale: "한 달 살기·장기체류 수요" },
    { slug: "kakheti", name: "Kakheti", nameKo: "카헤티", rationale: "와인 투어 니치" },
  ],
  primaryCategories: ["hotels", "local-tours", "car-rental", "travel-insurance"],
  affiliateNetworks: ["booking", "getyourguide"],
  paymentMethods: ["international-card"],
  marketScore: {
    tourismDemand: 6,
    digitalPaymentGrowth: 6,
    purchasingPower: 6,
    competitionOpportunity: 9,
    affiliateAvailability: 6,
  },
  enabled: false,
};
