import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { rankOffers, selectBestOffer } from "@/lib/affiliate/router";
import {
  calculateOfferScore,
  expectedConfirmedCommission,
} from "@/lib/affiliate/offerScore";
import type { OfferCandidate } from "@/lib/affiliate/types";

const base: OfferCandidate = {
  offerSlug: "test",
  providerSlug: "booking",
  countryCode: "VN",
  category: "hotels",
  landingUrl: "https://www.booking.com/city/vn/can-tho.html",
  price: 100,
  commissionRate: 0.04,
  conversionRate: 0.02,
};

describe("offer router", () => {
  beforeEach(() => {
    process.env.AFFILIATE_BOOKING_AID = "aid";
    process.env.AFFILIATE_AGODA_CID = "cid";
  });
  afterEach(() => {
    delete process.env.AFFILIATE_BOOKING_AID;
    delete process.env.AFFILIATE_AGODA_CID;
  });

  it("ranks higher expected value first", () => {
    const ranked = rankOffers([
      { ...base, offerSlug: "low", commissionRate: 0.02 },
      { ...base, offerSlug: "high", providerSlug: "agoda", commissionRate: 0.06 },
    ]);
    expect(ranked[0].offerSlug).toBe("high");
  });

  it("excludes unavailable offers", () => {
    const best = selectBestOffer([{ ...base, available: false }]);
    expect(best).toBeNull();
  });

  it("prefers free cancellation at equal economics", () => {
    const ranked = rankOffers([
      { ...base, offerSlug: "strict" },
      { ...base, offerSlug: "flexible", freeCancellation: true },
    ]);
    expect(ranked[0].offerSlug).toBe("flexible");
  });

  it("ranks unconfigured providers below configured ones", () => {
    delete process.env.AFFILIATE_AGODA_CID;
    const ranked = rankOffers([
      { ...base, offerSlug: "unconfigured", providerSlug: "agoda" },
      { ...base, offerSlug: "configured" },
    ]);
    expect(ranked[0].offerSlug).toBe("configured");
  });
});

describe("confirmed-revenue offer scoring", () => {
  const offer = {
    id: "1",
    provider: "klook",
    countryCode: "VN",
    productType: "local-tours",
    price: 50,
    currency: "USD",
    commissionRate: 0.08,
    conversionRate: 0.03,
    cancellationRate: 0.2,
    availabilityScore: 80,
  };

  it("discounts cancellations from expected commission", () => {
    // 50 * 0.08 * 0.03 * 0.8 = 0.096
    expect(expectedConfirmedCommission(offer)).toBeCloseTo(0.096);
  });

  it("blends commission (60%) and availability (40%)", () => {
    expect(calculateOfferScore(offer)).toBeCloseTo(0.096 * 0.6 + 80 * 0.4, 2);
  });
});
