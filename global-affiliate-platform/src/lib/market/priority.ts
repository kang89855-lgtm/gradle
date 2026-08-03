// Country scoring formula (fixed weights, HQ-approved):
// tourism 25% · payment growth 20% · purchasing power 15% ·
// low-competition opportunity 20% · affiliate inventory 15% · cost efficiency 5%

export interface MarketMetrics {
  tourismDemand: number; // 0–10
  paymentGrowth: number; // 0–10
  purchasingPower: number; // 0–10
  competitionLevel: number; // 0–10, higher = harder market
  affiliateCoverage: number; // 0–10
  contentProductionCost: number; // 0–10, higher = more expensive
}

export const MARKET_WEIGHTS = {
  tourismDemand: 0.25,
  paymentGrowth: 0.2,
  purchasingPower: 0.15,
  competitionOpportunity: 0.2,
  affiliateCoverage: 0.15,
  costEfficiency: 0.05,
} as const;

function clamp(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(10, Math.max(0, value));
}

export function calculateMarketPriority(metrics: MarketMetrics): number {
  const competitionOpportunity = 10 - clamp(metrics.competitionLevel);
  const costEfficiency = 10 - clamp(metrics.contentProductionCost);

  const score =
    clamp(metrics.tourismDemand) * MARKET_WEIGHTS.tourismDemand +
    clamp(metrics.paymentGrowth) * MARKET_WEIGHTS.paymentGrowth +
    clamp(metrics.purchasingPower) * MARKET_WEIGHTS.purchasingPower +
    competitionOpportunity * MARKET_WEIGHTS.competitionOpportunity +
    clamp(metrics.affiliateCoverage) * MARKET_WEIGHTS.affiliateCoverage +
    costEfficiency * MARKET_WEIGHTS.costEfficiency;

  return Number(score.toFixed(2));
}
