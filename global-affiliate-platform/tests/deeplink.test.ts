import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appendParams, toSubId, withUtm } from "@/lib/affiliate/deeplink";
import { bookingAdapter } from "@/lib/affiliate/adapters/booking";
import { agodaAdapter } from "@/lib/affiliate/adapters/agoda";

describe("deeplink helpers", () => {
  it("appends params without clobbering existing query strings", () => {
    const url = appendParams("https://example.com/x?a=1", { b: "2", c: undefined });
    expect(url).toBe("https://example.com/x?a=1&b=2");
  });

  it("adds UTM tags", () => {
    const url = withUtm("https://example.com/", {
      source: "site",
      medium: "affiliate",
      campaign: "vn-can-tho",
    });
    expect(url).toContain("utm_source=site");
    expect(url).toContain("utm_campaign=vn-can-tho");
  });

  it("sanitizes sub-ids", () => {
    expect(toSubId("VN Can Tho / hotels!")).toBe("vn-can-tho-hotels");
  });
});

describe("provider adapters", () => {
  const ENV_KEYS = ["AFFILIATE_BOOKING_AID", "AFFILIATE_AGODA_CID"];
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of ENV_KEYS) saved[key] = process.env[key];
  });
  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it("reports unconfigured when the env var is missing", () => {
    delete process.env.AFFILIATE_BOOKING_AID;
    expect(bookingAdapter.isConfigured()).toBe(false);
  });

  it("builds a booking deep link from the env credential", () => {
    process.env.AFFILIATE_BOOKING_AID = "12345";
    const url = bookingAdapter.buildDeepLink({
      landingUrl: "https://www.booking.com/city/vn/can-tho.html",
      subId: "vn-can-tho-hotels",
      locale: "ko",
      currency: "VND",
    });
    expect(url).toContain("aid=12345");
    expect(url).toContain("label=vn-can-tho-hotels");
    expect(url).toContain("selected_currency=VND");
  });

  it("builds an agoda deep link with cid", () => {
    process.env.AFFILIATE_AGODA_CID = "999";
    const url = agodaAdapter.buildDeepLink({
      landingUrl: "https://www.agoda.com/city/can-tho-vn.html",
      subId: "test",
    });
    expect(url).toContain("cid=999");
  });

  it("never embeds credentials in source (adapter reads env only)", () => {
    delete process.env.AFFILIATE_AGODA_CID;
    const url = agodaAdapter.buildDeepLink({
      landingUrl: "https://www.agoda.com/city/can-tho-vn.html",
    });
    expect(url).not.toContain("cid=");
  });
});
