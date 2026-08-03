import { describe, expect, it } from "vitest";
import { calculateMarketPriority } from "@/lib/market/priority";
import {
  calculateOpportunityScore,
  decideOpportunityAction,
} from "@/lib/market/opportunity";

describe("calculateMarketPriority", () => {
  it("returns a perfect 10 for a perfect market", () => {
    expect(
      calculateMarketPriority({
        tourismDemand: 10,
        paymentGrowth: 10,
        purchasingPower: 10,
        competitionLevel: 0,
        affiliateCoverage: 10,
        contentProductionCost: 0,
      }),
    ).toBe(10);
  });

  it("matches the weighted formula for Vietnam-like inputs", () => {
    // 2.25 + 1.6 + 0.9 + 1.6 + 1.35 + 0.25 = 7.95
    expect(
      calculateMarketPriority({
        tourismDemand: 9,
        paymentGrowth: 8,
        purchasingPower: 6,
        competitionLevel: 2,
        affiliateCoverage: 9,
        contentProductionCost: 5,
      }),
    ).toBe(7.95);
  });

  it("clamps out-of-range inputs instead of exploding the score", () => {
    const score = calculateMarketPriority({
      tourismDemand: 999,
      paymentGrowth: -5,
      purchasingPower: 10,
      competitionLevel: -100,
      affiliateCoverage: 10,
      contentProductionCost: 0,
    });
    expect(score).toBeLessThanOrEqual(10);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("opportunity scoring", () => {
  it("scores a strong opportunity above the BUILD_NOW threshold", () => {
    const score = calculateOpportunityScore({
      searchDemand: 90,
      competitionLevel: 10,
      expectedCommission: 85,
      affiliateAvailability: 90,
      seasonalDemand: 80,
      paymentReadiness: 85,
      contentCost: 20,
      topicalAuthority: 70,
    });
    expect(score).toBeGreaterThanOrEqual(80);
    expect(decideOpportunityAction(score)).toBe("BUILD_NOW");
  });

  it("classifies thresholds exactly", () => {
    expect(decideOpportunityAction(80)).toBe("BUILD_NOW");
    expect(decideOpportunityAction(79.99)).toBe("VALIDATE");
    expect(decideOpportunityAction(65)).toBe("VALIDATE");
    expect(decideOpportunityAction(64.99)).toBe("WATCH");
    expect(decideOpportunityAction(50)).toBe("WATCH");
    expect(decideOpportunityAction(49.99)).toBe("REJECT");
  });
});
