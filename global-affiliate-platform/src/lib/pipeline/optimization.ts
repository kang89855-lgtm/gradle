// Scale / fix / replace / retire decisions from measured page performance.
// Thresholds are configurable; defaults follow the profit-pipeline spec.

export interface PageMetrics {
  monthlySessions: number;
  affiliateCtr: number; // 0–1
  confirmedConversionRate: number; // 0–1
  rpmUsd: number; // confirmed revenue per 1,000 sessions
  contentRoi: number; // net profit ÷ production cost, 1.5 = 150 %
  daysSincePublished: number;
  totalRevenue: number;
  opportunityScore: number; // 0–100
}

export interface OptimizationThresholds {
  scaleSessions: number;
  scaleCtr: number;
  scaleCvr: number;
  scaleRpm: number;
  scaleRoi: number;
  fixCtrBelow: number;
  replaceCvrBelow: number;
  retireAfterDays: number;
  retireSessionsBelow: number;
  retireOpportunityBelow: number;
}

export const DEFAULT_THRESHOLDS: OptimizationThresholds = {
  scaleSessions: 500,
  scaleCtr: 0.12,
  scaleCvr: 0.02,
  scaleRpm: 25,
  scaleRoi: 1.5,
  fixCtrBelow: 0.08,
  replaceCvrBelow: 0.01,
  retireAfterDays: 90,
  retireSessionsBelow: 100,
  retireOpportunityBelow: 50,
};

export type PageAction =
  | "SCALE" // spawn derivative content + translations
  | "FIX_LAYOUT" // traffic fine, affiliate CTR weak → CTA/comparison-table work
  | "REPLACE_OFFER" // clicks fine, confirmed conversion weak → provider problem
  | "RETIRE" // merge into a stronger page + redirect
  | "KEEP";

export function decidePageAction(
  m: PageMetrics,
  t: OptimizationThresholds = DEFAULT_THRESHOLDS,
): PageAction {
  if (
    m.daysSincePublished >= t.retireAfterDays &&
    m.monthlySessions < t.retireSessionsBelow &&
    m.totalRevenue === 0 &&
    m.opportunityScore < t.retireOpportunityBelow
  ) {
    return "RETIRE";
  }
  if (m.affiliateCtr >= t.scaleCtr && m.confirmedConversionRate < t.replaceCvrBelow) {
    return "REPLACE_OFFER";
  }
  if (m.monthlySessions >= t.scaleSessions && m.affiliateCtr < t.fixCtrBelow) {
    return "FIX_LAYOUT";
  }
  if (
    m.monthlySessions >= t.scaleSessions &&
    m.affiliateCtr >= t.scaleCtr &&
    m.confirmedConversionRate >= t.scaleCvr &&
    m.rpmUsd >= t.scaleRpm &&
    m.contentRoi >= t.scaleRoi
  ) {
    return "SCALE";
  }
  return "KEEP";
}
