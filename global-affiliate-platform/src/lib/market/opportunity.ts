// Profit Opportunity Score (0–100) — decides daily what to build next.
// Weights: purchase-intent search demand 20% · low competition 20% ·
// expected commission 15% · affiliate inventory 15% · seasonal fit 10% ·
// payment readiness 10% · content cost efficiency 5% · topical authority 5%

export interface OpportunityInput {
  searchDemand: number; // 0–100
  competitionLevel: number; // 0–100, higher = harder
  expectedCommission: number; // 0–100 normalized
  affiliateAvailability: number; // 0–100
  seasonalDemand: number; // 0–100 for the planned publication window
  paymentReadiness: number; // 0–100
  contentCost: number; // 0–100, higher = more expensive
  topicalAuthority: number; // 0–100, relevance to existing site content
}

export type OpportunityAction = "BUILD_NOW" | "VALIDATE" | "WATCH" | "REJECT";

function clamp100(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function calculateOpportunityScore(input: OpportunityInput): number {
  const competitionOpportunity = 100 - clamp100(input.competitionLevel);
  const costEfficiency = 100 - clamp100(input.contentCost);

  const score =
    clamp100(input.searchDemand) * 0.2 +
    competitionOpportunity * 0.2 +
    clamp100(input.expectedCommission) * 0.15 +
    clamp100(input.affiliateAvailability) * 0.15 +
    clamp100(input.seasonalDemand) * 0.1 +
    clamp100(input.paymentReadiness) * 0.1 +
    costEfficiency * 0.05 +
    clamp100(input.topicalAuthority) * 0.05;

  return Number(score.toFixed(2));
}

export function decideOpportunityAction(score: number): OpportunityAction {
  if (score >= 80) return "BUILD_NOW";
  if (score >= 65) return "VALIDATE";
  if (score >= 50) return "WATCH";
  return "REJECT";
}
