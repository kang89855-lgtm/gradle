/**
 * Shared deep-link construction helpers.
 *
 * All providers here are manual deep-link adapters: we append documented
 * affiliate query parameters to the product's own landing URL. No scraping,
 * no undocumented endpoints.
 */

export function appendParams(
  landingUrl: string,
  params: Record<string, string | undefined>,
): string {
  const url = new URL(landingUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export interface UtmParams {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

/** UTM tags for outbound links where the provider supports them. */
export function withUtm(landingUrl: string, utm: UtmParams): string {
  return appendParams(landingUrl, {
    utm_source: utm.source,
    utm_medium: utm.medium,
    utm_campaign: utm.campaign,
    utm_content: utm.content,
  });
}

/** Sanitize a free-form label into a provider-safe sub-id. */
export function toSubId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
