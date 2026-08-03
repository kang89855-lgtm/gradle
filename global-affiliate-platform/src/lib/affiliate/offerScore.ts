// Offer scoring per the profit-pipeline spec: rank by *confirmed* expected
// revenue (conversion × survival after cancellations), not by headline
// commission rate.

export interface ScoredAffiliateOffer {
  id: string;
  provider: string;
  countryCode: string;
  productType: string;
  price: number;
  currency: string;
  commissionRate: number; // 0–1
  conversionRate: number; // 0–1
  cancellationRate: number; // 0–1
  availabilityScore: number; // 0–100
}

export function expectedConfirmedCommission(offer: ScoredAffiliateOffer): number {
  return (
    offer.price *
    offer.commissionRate *
    offer.conversionRate *
    (1 - offer.cancellationRate)
  );
}

export function calculateOfferScore(offer: ScoredAffiliateOffer): number {
  const commission = expectedConfirmedCommission(offer);
  return Number((commission * 0.6 + offer.availabilityScore * 0.4).toFixed(2));
}

export function rankScoredOffers(
  offers: ScoredAffiliateOffer[],
): Array<ScoredAffiliateOffer & { score: number }> {
  return offers
    .map((o) => ({ ...o, score: calculateOfferScore(o) }))
    .sort((a, b) => b.score - a.score);
}
