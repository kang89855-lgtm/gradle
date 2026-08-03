import type { DeepLinkInput, ProviderAdapter } from "../types";
import { appendParams, toSubId } from "../deeplink";

export const agodaAdapter: ProviderAdapter = {
  slug: "agoda",
  name: "Agoda Affiliate Partner",
  requiredEnvVars: ["AFFILIATE_AGODA_CID"],
  manualDeepLink: true,
  isConfigured() {
    return Boolean(process.env.AFFILIATE_AGODA_CID);
  },
  buildDeepLink(input: DeepLinkInput): string {
    const cid = process.env.AFFILIATE_AGODA_CID;
    return appendParams(input.landingUrl, {
      cid,
      tag: input.subId ? toSubId(input.subId) : undefined,
      currency: input.currency,
    });
  },
};
