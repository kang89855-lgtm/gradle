import type { CountryStrategy } from "./types";

export const malaysiaStrategy: CountryStrategy = {
  code: "MY",
  slug: "malaysia",
  name: "Malaysia",
  nameKo: "말레이시아",
  phase: 1,
  languages: ["ko", "en", "ms"],
  currencies: ["KRW", "USD", "MYR"],
  localCurrency: "MYR",
  targetCities: [
    {
      slug: "ipoh",
      name: "Ipoh",
      nameKo: "이포",
      rationale: "쿠알라룸푸르 근교 미식·동굴사원 니치, 한국어 경쟁 낮음",
    },
    {
      slug: "kuching",
      name: "Kuching",
      nameKo: "쿠칭",
      rationale: "보르네오 자연 투어 상품 다수, 검색 경쟁 매우 낮음",
    },
    {
      slug: "johor-bahru",
      name: "Johor Bahru",
      nameKo: "조호르바루",
      rationale: "싱가포르 연계 이동 수요, 국경 교통 예약형 검색어 장악 가능",
    },
    {
      slug: "langkawi",
      name: "Langkawi",
      nameKo: "랑카위",
      rationale: "리조트·액티비티 재고 풍부, 세부 지역·상품 단위로는 경쟁 여지",
    },
  ],
  primaryCategories: [
    "hotels",
    "local-tours",
    "airport-transfers",
    "car-rental",
    "esim",
  ],
  affiliateNetworks: ["booking", "agoda", "klook", "getyourguide"],
  paymentMethods: ["international-card", "local-wallet", "online-banking"],
  marketScore: {
    tourismDemand: 7,
    digitalPaymentGrowth: 9,
    purchasingPower: 8,
    competitionOpportunity: 7,
    affiliateAvailability: 8,
  },
  enabled: true,
};
