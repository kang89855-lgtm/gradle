import type { DeepLinkInput, ProviderAdapter } from "../types";
import { appendParams, toSubId } from "../deeplink";

export const bookingAdapter: ProviderAdapter = {
  slug: "booking",
  name: "Booking.com Affiliate Partner",
  requiredEnvVars: ["AFFILIATE_BOOKING_AID"],
  manualDeepLink: true,
  isConfigured() {
    return Boolean(process.env.AFFILIATE_BOOKING_AID);
  },
  buildDeepLink(input: DeepLinkInput): string {
    const aid = process.env.AFFILIATE_BOOKING_AID;
    return appendParams(input.landingUrl, {
      aid,
      label: input.subId ? toSubId(input.subId) : undefined,
      lang: input.locale,
      selected_currency: input.currency,
    });
  },
};
