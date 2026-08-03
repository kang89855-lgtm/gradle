import { describe, expect, it } from "vitest";
import { canTransition, shouldTranslatePage } from "@/lib/content/workflow";
import { decidePageAction, DEFAULT_THRESHOLDS } from "@/lib/pipeline/optimization";
import { buildCommercialKeyword, isLowIntent } from "@/lib/keywords/commercial";
import { convert, formatMoney, toKrw } from "@/lib/currency/exchange";

describe("content workflow", () => {
  it("follows the happy path in order", () => {
    const path = [
      "DISCOVERED", "PLANNED", "GENERATED", "FACT_CHECKED",
      "AFFILIATE_LINKED", "HUMAN_REVIEWED", "SCHEDULED", "PUBLISHED",
    ] as const;
    for (let i = 0; i < path.length - 1; i++) {
      expect(canTransition(path[i], path[i + 1])).toBe(true);
    }
  });

  it("cannot publish AI-generated content without review", () => {
    expect(canTransition("GENERATED", "PUBLISHED")).toBe(false);
    expect(canTransition("GENERATED", "SCHEDULED")).toBe(false);
    expect(canTransition("FACT_CHECKED", "PUBLISHED")).toBe(false);
    expect(canTransition("AFFILIATE_LINKED", "PUBLISHED")).toBe(false);
  });

  it("translation requires proven demand", () => {
    expect(
      shouldTranslatePage({
        monthlySessions: 10, affiliateClicks: 1,
        confirmedConversions: 0, opportunityScore: 40,
      }),
    ).toBe(false);
    expect(
      shouldTranslatePage({
        monthlySessions: 10, affiliateClicks: 1,
        confirmedConversions: 2, opportunityScore: 40,
      }),
    ).toBe(true);
  });
});

describe("page optimization decisions", () => {
  const good = {
    monthlySessions: 1000, affiliateCtr: 0.15, confirmedConversionRate: 0.03,
    rpmUsd: 30, contentRoi: 2, daysSincePublished: 30,
    totalRevenue: 500, opportunityScore: 85,
  };

  it("scales proven winners", () => {
    expect(decidePageAction(good)).toBe("SCALE");
  });

  it("retires dead pages after 90 days", () => {
    expect(
      decidePageAction({
        ...good, daysSincePublished: 120, monthlySessions: 50,
        totalRevenue: 0, opportunityScore: 30,
        affiliateCtr: 0.01, confirmedConversionRate: 0, rpmUsd: 0, contentRoi: 0,
      }),
    ).toBe("RETIRE");
  });

  it("flags offer problems when clicks convert poorly", () => {
    expect(
      decidePageAction({ ...good, affiliateCtr: 0.15, confirmedConversionRate: 0.005 }),
    ).toBe("REPLACE_OFFER");
  });

  it("flags layout problems when traffic doesn't click", () => {
    expect(decidePageAction({ ...good, affiliateCtr: 0.05 })).toBe("FIX_LAYOUT");
  });

  it("keeps pages that are fine but not exceptional", () => {
    expect(decidePageAction({ ...good, rpmUsd: DEFAULT_THRESHOLDS.scaleRpm - 1 })).toBe("KEEP");
  });
});

describe("commercial keywords", () => {
  it("assembles the full pattern", () => {
    expect(
      buildCommercialKeyword({
        country: "Vietnam", city: "Can Tho", travelerType: "family",
        product: "Mekong tour", modifier: "price and booking", season: "December",
      }),
    ).toBe("Vietnam Can Tho family Mekong tour price and booking December");
  });

  it("skips missing parts", () => {
    expect(
      buildCommercialKeyword({ city: "껀터", product: "메콩강 투어", modifier: "가격 예약" }),
    ).toBe("껀터 메콩강 투어 가격 예약");
  });

  it("detects low-intent keywords", () => {
    expect(isLowIntent("껀터 역사 문화")).toBe(true);
    expect(isLowIntent("껀터 메콩강 투어 예약")).toBe(false);
  });
});

describe("currency engine", () => {
  it("KRW is identity", () => {
    expect(toKrw(1000, "KRW")).toBe(1000);
  });

  it("round-trips through KRW", () => {
    const usd = 100;
    const krw = convert(usd, "USD", "KRW");
    expect(convert(krw, "KRW", "USD")).toBeCloseTo(usd);
  });

  it("formats zero-decimal currencies without cents", () => {
    expect(formatMoney(1234, "KRW", "en-US")).not.toContain(".");
  });
});
