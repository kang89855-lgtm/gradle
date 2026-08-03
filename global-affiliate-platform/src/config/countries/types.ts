export type CountryCode = "VN" | "MY" | "PH" | "ID" | "UZ" | "GE";

export type OfferCategory =
  | "hotels"
  | "local-tours"
  | "airport-transfers"
  | "car-rental"
  | "esim"
  | "travel-insurance"
  | "flights"
  | "local-services";

export interface TargetCity {
  slug: string;
  name: string;
  nameKo: string;
  /** why this city is a low-competition opportunity */
  rationale: string;
}

export interface MarketScore {
  tourismDemand: number;
  digitalPaymentGrowth: number;
  purchasingPower: number;
  competitionOpportunity: number; // higher = less competition = better
  affiliateAvailability: number;
}

export interface CountryStrategy {
  code: CountryCode;
  slug: string; // URL segment: vietnam, malaysia, ...
  name: string;
  nameKo: string;
  phase: 1 | 2;
  languages: string[]; // content locales served for this country
  currencies: string[]; // KRW (HQ) + USD + local
  localCurrency: string;
  targetCities: TargetCity[];
  primaryCategories: OfferCategory[];
  affiliateNetworks: string[]; // provider slugs
  paymentMethods: string[];
  marketScore: MarketScore;
  enabled: boolean;
}
