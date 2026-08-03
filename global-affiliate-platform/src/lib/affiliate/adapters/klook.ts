import type { DeepLinkInput, ProviderAdapter } from "../types";
import { appendParams, toSubId } from "../deeplink";

export const klookAdapter: ProviderAdapter = {
  slug: "klook",
  name: "Klook Affiliate Program",
  requiredEnvVars: ["AFFILIATE_KLOOK_AID"],
  manualDeepLink: true,
  isConfigured() {
    return Boolean(process.env.AFFILIATE_KLOOK_AID);
  },
  buildDeepLink(input: DeepLinkInput): string {
    const aid = process.env.AFFILIATE_KLOOK_AID;
    return appendParams(input.landingUrl, {
      aid,
      aff_adid: input.subId ? toSubId(input.subId) : undefined,
      krt: input.currency,
    });
  },
};
