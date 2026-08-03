import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { enabledCountries, getCountryBySlug } from "@/config/countries";
import { SUPPORTED_LOCALES, getDictionary, isSupportedLocale } from "@/lib/i18n";
import { getSiteUrl } from "@/lib/site";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    enabledCountries.map((country) => ({ locale, country: country.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}): Promise<Metadata> {
  const { locale, country: countrySlug } = await params;
  const country = getCountryBySlug(countrySlug);
  if (!country) return {};
  const site = getSiteUrl();
  return {
    title: locale === "ko" ? country.nameKo : country.name,
    alternates: {
      canonical: `${site}/${locale}/${country.slug}`,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${site}/${l}/${country.slug}`]),
      ),
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country: countrySlug } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const country = getCountryBySlug(countrySlug);
  if (!country || !country.enabled) notFound();

  const dict = getDictionary(locale);
  const isKo = locale === "ko";

  return (
    <main>
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={`/${locale}`} className="hover:underline">
          {dict.countries}
        </Link>{" "}
        / {isKo ? country.nameKo : country.name}
      </nav>
      <h1 className="mb-6 text-2xl font-bold">
        {isKo ? country.nameKo : country.name}
      </h1>

      <h2 className="mb-4 text-lg font-semibold">{dict.targetCities}</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {country.targetCities.map((city) => (
          <li key={city.slug}>
            <Link
              href={`/${locale}/${country.slug}/${city.slug}`}
              className="block rounded-lg border border-slate-200 p-4 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
            >
              <span className="block font-semibold">
                {isKo ? city.nameKo : city.name}
              </span>
              {isKo && (
                <span className="mt-1 block text-sm text-slate-500">
                  {city.rationale}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
