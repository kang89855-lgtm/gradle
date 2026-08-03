import type { MetadataRoute } from "next";
import { enabledCountries } from "@/config/countries";
import { SUPPORTED_LOCALES } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    entries.push({ url: `${site}/${locale}`, changeFrequency: "daily", priority: 1 });
    for (const country of enabledCountries) {
      entries.push({
        url: `${site}/${locale}/${country.slug}`,
        changeFrequency: "daily",
        priority: 0.8,
      });
      for (const city of country.targetCities) {
        entries.push({
          url: `${site}/${locale}/${country.slug}/${city.slug}`,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }
  return entries;
}
