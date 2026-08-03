import type { DeepLinkInput, ProviderAdapter } from "../types";
import { appendParams, toSubId } from "../deeplink";

export const getYourGuideAdapter: ProviderAdapter = {
  slug: "getyourguide",
  name: "GetYourGuide Partner Program",
  requiredEnvVars: ["AFFILIATE_GYG_PARTNER_ID"],
  manualDeepLink: true,
  isConfigured() {
    return Boolean(process.env.AFFILIATE_GYG_PARTNER_ID);
  },
  buildDeepLink(input: DeepLinkInput): string {
    const partnerId = process.env.AFFILIATE_GYG_PARTNER_ID;
    return appendParams(input.landingUrl, {
      partner_id: partnerId,
      cmp: input.subId ? toSubId(input.subId) : undefined,
      currency: input.currency,
    });
  },
};
