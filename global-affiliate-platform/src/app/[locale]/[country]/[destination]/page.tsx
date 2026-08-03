import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { enabledCountries, getCountryBySlug } from "@/config/countries";
import { getOffersForDestination } from "@/config/offers";
import { SUPPORTED_LOCALES, getDictionary, isSupportedLocale } from "@/lib/i18n";
import { getDisclosure } from "@/lib/compliance/disclosure";
import { getSiteUrl } from "@/lib/site";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    enabledCountries.flatMap((country) =>
      country.targetCities.map((city) => ({
        locale,
        country: country.slug,
        destination: city.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; country: string; destination: string }>;
}): Promise<Metadata> {
  const { locale, country: countrySlug, destination } = await params;
  const country = getCountryBySlug(countrySlug);
  const city = country?.targetCities.find((c) => c.slug === destination);
  if (!country || !city) return {};
  const site = getSiteUrl();
  const path = `/${country.slug}/${city.slug}`;
  return {
    title: locale === "ko" ? `${city.nameKo} 여행 예약` : `${city.name} travel bookings`,
    alternates: {
      canonical: `${site}/${locale}${path}`,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${site}/${l}${path}`]),
      ),
    },
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; destination: string }>;
}) {
  const { locale, country: countrySlug, destination } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const country = getCountryBySlug(countrySlug);
  if (!country || !country.enabled) notFound();
  const city = country.targetCities.find((c) => c.slug === destination);
  if (!city) notFound();

  const dict = getDictionary(locale);
  const isKo = locale === "ko";
  const offers = getOffersForDestination(country.code, city.slug);
  const disclosure = getDisclosure(locale);
  const site = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        name: city.name,
        alternateName: city.nameKo,
        containedInPlace: { "@type": "Country", name: country.name },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: isKo ? country.nameKo : country.name,
            item: `${site}/${locale}/${country.slug}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: isKo ? city.nameKo : city.name,
            item: `${site}/${locale}/${country.slug}/${city.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-4 text-sm text-slate-500">
        <Link href={`/${locale}`} className="hover:underline">
          {dict.countries}
        </Link>{" "}
        /{" "}
        <Link href={`/${locale}/${country.slug}`} className="hover:underline">
          {isKo ? country.nameKo : country.name}
        </Link>{" "}
        / {isKo ? city.nameKo : city.name}
      </nav>

      <h1 className="mb-2 text-2xl font-bold">
        {isKo ? city.nameKo : city.name}
      </h1>
      {isKo && (
        <p className="mb-6 text-slate-600 dark:text-slate-400">
          {dict.whyThisCity}: {city.rationale}
        </p>
      )}

      {/* Disclosure must appear before the first affiliate link */}
      <aside className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        <strong>{disclosure.title}</strong> — {disclosure.body}
      </aside>

      <h2 className="mb-4 text-lg font-semibold">{dict.offers}</h2>
      {offers.length === 0 ? (
        <p className="text-slate-500">{dict.noOffers}</p>
      ) : (
        <ul className="space-y-3">
          {offers.map((offer) => (
            <li
              key={offer.slug}
              className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
            >
              <div>
                <span className="block font-medium">
                  {isKo ? offer.title.ko : offer.title.en}
                </span>
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {offer.category} · {offer.providerSlug}
                </span>
              </div>
              <a
                href={`/go/${offer.slug}?loc=${locale}`}
                rel="nofollow sponsored"
                className="shrink-0 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {dict.bookNow}
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
