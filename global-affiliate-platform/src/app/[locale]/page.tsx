import Link from "next/link";
import { notFound } from "next/navigation";
import { enabledCountries } from "@/config/countries";
import { getDictionary, isSupportedLocale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const dict = getDictionary(locale);
  const isKo = locale === "ko";

  return (
    <main>
      <h1 className="mb-1 text-2xl font-bold">{dict.siteName}</h1>
      <p className="mb-8 text-slate-600 dark:text-slate-400">{dict.tagline}</p>

      <h2 className="mb-4 text-lg font-semibold">{dict.countries}</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {enabledCountries.map((country) => (
          <li key={country.code}>
            <Link
              href={`/${locale}/${country.slug}`}
              className="block rounded-lg border border-slate-200 p-4 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600"
            >
              <span className="block text-base font-semibold">
                {isKo ? country.nameKo : country.name}
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                {country.targetCities.length} {dict.destinations}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
