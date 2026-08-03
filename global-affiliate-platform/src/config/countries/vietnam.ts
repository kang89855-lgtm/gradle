import type { CountryStrategy } from "./types";

export const vietnamStrategy: CountryStrategy = {
  code: "VN",
  slug: "vietnam",
  name: "Vietnam",
  nameKo: "베트남",
  phase: 1,
  languages: ["ko", "en", "vi"],
  currencies: ["KRW", "USD", "VND"],
  localCurrency: "VND",
  targetCities: [
    {
      slug: "can-tho",
      name: "Can Tho",
      nameKo: "껀터",
      rationale: "메콩 델타 투어 수요 대비 한국어 콘텐츠가 거의 없음",
    },
    {
      slug: "quy-nhon",
      name: "Quy Nhon",
      nameKo: "꾸이년",
      rationale: "신규 직항·리조트 개발 중, 검색 경쟁 낮음",
    },
    {
      slug: "ninh-binh",
      name: "Ninh Binh",
      nameKo: "닌빈",
      rationale: "하노이 근교 당일투어 상품 재고 풍부, 예약형 검색어 경쟁 낮음",
    },
    {
      slug: "hai-phong",
      name: "Hai Phong",
      nameKo: "하이퐁",
      rationale: "직항 노선 보유, 깟바섬 연계 상품 다수",
    },
    {
      slug: "buon-ma-thuot",
      name: "Buon Ma Thuot",
      nameKo: "부온마투옷",
      rationale: "커피 투어 니치, 한국어 문서 극소수",
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
  paymentMethods: ["international-card", "local-wallet", "bank-transfer"],
  marketScore: {
    tourismDemand: 9,
    digitalPaymentGrowth: 8,
    purchasingPower: 6,
    competitionOpportunity: 8,
    affiliateAvailability: 9,
  },
  enabled: true,
};
