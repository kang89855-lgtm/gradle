import { describe, expect, it } from "vitest";
import { allCountries, enabledCountries, getCountryBySlug } from "@/config/countries";
import { staticOffers, getOfferBySlug, getOffersForDestination } from "@/config/offers";
import { adapters } from "@/lib/affiliate/adapters";

describe("country configuration", () => {
  it("registers all six markets", () => {
    expect(allCountries.map((c) => c.code).sort()).toEqual([
      "GE", "ID", "MY", "PH", "UZ", "VN",
    ]);
  });

  it("enables only phase-1 countries", () => {
    expect(enabledCountries.map((c) => c.code).sort()).toEqual(["MY", "PH", "VN"]);
    for (const c of enabledCountries) expect(c.phase).toBe(1);
  });

  it("every country carries KRW as HQ reporting currency", () => {
    for (const c of allCountries) {
      expect(c.currencies).toContain("KRW");
      expect(c.currencies).toContain("USD");
      expect(c.currencies).toContain(c.localCurrency);
    }
  });

  it("resolves countries by slug", () => {
    expect(getCountryBySlug("vietnam")?.code).toBe("VN");
    expect(getCountryBySlug("nowhere")).toBeUndefined();
  });
});

describe("static offer catalog", () => {
  it("has unique slugs", () => {
    const slugs = staticOffers.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("references only registered providers and destinations", () => {
    for (const offer of staticOffers) {
      expect(adapters[offer.providerSlug]).toBeDefined();
      const country = allCountries.find((c) => c.code === offer.countryCode);
      expect(country).toBeDefined();
      expect(country!.targetCities.map((c) => c.slug)).toContain(offer.destinationSlug);
    }
  });

  it("uses valid https landing URLs", () => {
    for (const offer of staticOffers) {
      expect(() => new URL(offer.landingUrl)).not.toThrow();
      expect(offer.landingUrl.startsWith("https://")).toBe(true);
    }
  });

  it("finds offers per destination", () => {
    expect(getOfferBySlug("vn-can-tho-hotels-booking")).toBeDefined();
    expect(getOffersForDestination("VN", "can-tho").length).toBeGreaterThanOrEqual(2);
  });
});
