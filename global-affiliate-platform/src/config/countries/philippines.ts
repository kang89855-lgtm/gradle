import type { CountryStrategy } from "./types";

export const philippinesStrategy: CountryStrategy = {
  code: "PH",
  slug: "philippines",
  name: "Philippines",
  nameKo: "필리핀",
  phase: 1,
  languages: ["ko", "en"],
  currencies: ["KRW", "USD", "PHP"],
  localCurrency: "PHP",
  targetCities: [
    {
      slug: "iloilo",
      name: "Iloilo",
      nameKo: "일로일로",
      rationale: "기가란테스 섬투어 니치, 한국어 콘텐츠 공백",
    },
    {
      slug: "dumaguete",
      name: "Dumaguete",
      nameKo: "두마게테",
      rationale: "다이빙·장기체류 수요, 예약형 검색어 경쟁 낮음",
    },
    {
      slug: "davao",
      name: "Davao",
      nameKo: "다바오",
      rationale: "민다나오 최대 도시, 국내여행 수요 성장",
    },
    {
      slug: "siquijor",
      name: "Siquijor",
      nameKo: "시키호르",
      rationale: "신흥 섬 여행지, 상품 재고 증가 중",
    },
  ],
  primaryCategories: [
    "hotels",
    "local-tours",
    "airport-transfers",
    "esim",
    "travel-insurance",
  ],
  affiliateNetworks: ["booking", "agoda", "klook", "getyourguide"],
  paymentMethods: ["international-card", "local-wallet"],
  marketScore: {
    tourismDemand: 7,
    digitalPaymentGrowth: 8,
    purchasingPower: 6,
    competitionOpportunity: 8,
    affiliateAvailability: 7,
  },
  enabled: true,
};
