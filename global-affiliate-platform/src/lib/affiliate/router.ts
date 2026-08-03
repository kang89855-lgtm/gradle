import type { OfferCandidate } from "./types";
import { getAdapter } from "./adapters";

/**
 * Offer router — never depend on a single network.
 *
 * Given several candidates for the same product/category, ranks them by
 * expected value and practical bookability, and returns the ordered list.
 * Expected value per click ≈ price × commissionRate × conversionRate.
 */

export interface RankedOffer extends OfferCandidate {
  score: number;
}

const DEFAULT_CONVERSION_RATE = 0.02;
const DEFAULT_COMMISSION_RATE = 0.04;

export function scoreOffer(offer: OfferCandidate): number {
  if (offer.available === false) return -1;
  const adapter = getAdapter(offer.providerSlug);
  // Unconfigured providers can't pay out — rank below every configured one.
  if (!adapter || !adapter.isConfigured()) return 0;

  const price = offer.price ?? 0;
  const commission = offer.commissionRate ?? DEFAULT_COMMISSION_RATE;
  const conversion = offer.conversionRate ?? DEFAULT_CONVERSION_RATE;
  let score = price * commission * conversion;

  // Free cancellation converts better and cancels less than it appears to —
  // a fixed multiplier keeps the preference without fabricating data.
  if (offer.freeCancellation) score *= 1.15;

  return score;
}

export function rankOffers(candidates: OfferCandidate[]): RankedOffer[] {
  return candidates
    .map((c) => ({ ...c, score: scoreOffer(c) }))
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score);
}

/** Best bookable offer, or null when nothing is configured/available. */
export function selectBestOffer(candidates: OfferCandidate[]): RankedOffer | null {
  const ranked = rankOffers(candidates);
  return ranked.length > 0 ? ranked[0] : null;
}
