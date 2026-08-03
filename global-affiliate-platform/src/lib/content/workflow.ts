// Content lifecycle engine. Publication is impossible without passing
// FACT_CHECKED and HUMAN_REVIEWED — there is no transition that skips them.

export const CONTENT_STATES = [
  "DISCOVERED",
  "PLANNED",
  "GENERATED",
  "FACT_CHECKED",
  "AFFILIATE_LINKED",
  "HUMAN_REVIEWED",
  "SCHEDULED",
  "PUBLISHED",
  "MEASURED",
  "UPDATED",
  "EXPIRED",
  "ARCHIVED",
] as const;

export type ContentState = (typeof CONTENT_STATES)[number];

const TRANSITIONS: Record<ContentState, ContentState[]> = {
  DISCOVERED: ["PLANNED", "ARCHIVED"],
  PLANNED: ["GENERATED", "ARCHIVED"],
  GENERATED: ["FACT_CHECKED", "ARCHIVED"],
  FACT_CHECKED: ["AFFILIATE_LINKED", "GENERATED", "ARCHIVED"],
  AFFILIATE_LINKED: ["HUMAN_REVIEWED", "ARCHIVED"],
  HUMAN_REVIEWED: ["SCHEDULED", "GENERATED", "ARCHIVED"],
  SCHEDULED: ["PUBLISHED", "HUMAN_REVIEWED", "ARCHIVED"],
  PUBLISHED: ["MEASURED", "EXPIRED", "ARCHIVED"],
  MEASURED: ["UPDATED", "EXPIRED", "ARCHIVED"],
  UPDATED: ["MEASURED", "EXPIRED", "ARCHIVED"],
  EXPIRED: ["UPDATED", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransition(from: ContentState, to: ContentState): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export interface TranslationMetrics {
  monthlySessions: number;
  affiliateClicks: number;
  confirmedConversions: number;
  opportunityScore: number;
}

/** A page earns translation only after proving demand in its source language. */
export function shouldTranslatePage(metrics: TranslationMetrics): boolean {
  return (
    metrics.monthlySessions >= 300 ||
    metrics.affiliateClicks >= 10 ||
    metrics.confirmedConversions >= 2 ||
    metrics.opportunityScore >= 80
  );
}
