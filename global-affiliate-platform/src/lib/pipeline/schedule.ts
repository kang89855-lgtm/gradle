// System execution cadence. Job runners (cron / queue workers) consume this
// registry in Phase 2+; keeping it in code makes the cadence reviewable.

export const pipelineSchedule = {
  daily: [
    "syncExchangeRates",
    "validateAffiliateOffers",
    "checkBrokenLinks",
    "importClickAndRevenueData",
    "updateDashboard",
  ],
  weekly: [
    "discoverKeywords",
    "calculateOpportunityScores",
    "createContentBriefs",
    "reviewUnderperformingPages",
    "identifyTranslationCandidates",
  ],
  monthly: [
    "recalculateCountryScores",
    "reviewSeasonalCalendar",
    "calculateContentROI",
    "contactDirectMerchants",
    "archiveExpiredOffers",
  ],
  quarterly: [
    "compareCountryProfitability",
    "approveNewCountryExpansion",
    "reduceLowPerformingMarkets",
    "setNextQuarterContentBudget",
  ],
} as const;

export type PipelineJobName =
  (typeof pipelineSchedule)[keyof typeof pipelineSchedule][number];
