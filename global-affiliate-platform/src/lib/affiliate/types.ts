import type { CountryCode, OfferCategory } from "@/config/countries/types";

export interface DeepLinkInput {
  /** provider landing page for the product (must already be a valid URL) */
  landingUrl: string;
  /** internal tracking label forwarded as the provider sub-id where supported */
  subId?: string;
  locale?: string;
  currency?: string;
}

export interface OfferCandidate {
  offerSlug: string;
  providerSlug: string;
  countryCode: CountryCode;
  category: OfferCategory | string;
  landingUrl: string;
  price?: number;
  priceCurrency?: string;
  commissionRate?: number; // 0–1
  conversionRate?: number; // 0–1, measured
  freeCancellation?: boolean;
  available?: boolean;
}

/**
 * Provider adapter contract. Every network — API-based or manual deep-link —
 * implements this interface so the offer router stays provider-agnostic.
 *
 * Credentials are read from environment variables inside the adapter;
 * they are never passed through this interface or stored in code.
 */
export interface ProviderAdapter {
  slug: string;
  name: string;
  /** env var names this adapter needs; used for startup validation only */
  requiredEnvVars: string[];
  /** true when this adapter has no API and builds links manually */
  manualDeepLink: boolean;
  isConfigured(): boolean;
  buildDeepLink(input: DeepLinkInput): string;
}
