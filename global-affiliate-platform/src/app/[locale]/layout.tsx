import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPORTED_LOCALES, getDictionary, isSupportedLocale } from "@/lib/i18n";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <Link href={`/${locale}`} className="text-lg font-bold">
          {dict.siteName}
        </Link>
        <nav className="flex gap-3 text-sm">
          {SUPPORTED_LOCALES.map((l) => (
            <Link
              key={l}
              href={`/${l}`}
              className={
                l === locale
                  ? "font-semibold underline"
                  : "text-slate-500 hover:underline"
              }
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>
      {children}
      <footer className="mt-12 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800">
        <p>© Global Travel Deals · Daejeon, Republic of Korea</p>
      </footer>
    </div>
  );
}
