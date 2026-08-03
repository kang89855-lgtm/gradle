// Currency engine — KRW is the HQ reporting currency; USD and local
// currencies are displayed alongside it. Static fallback rates keep the UI
// functional before the live ExchangeRate table is populated; they are
// clearly approximate and every display marks prices as "약 (approx.)".

export type CurrencyCode =
  | "KRW"
  | "USD"
  | "VND"
  | "MYR"
  | "PHP"
  | "IDR"
  | "UZS"
  | "GEL";

export const CURRENCY_INFO: Record<CurrencyCode, { name: string; symbol: string }> = {
  KRW: { name: "대한민국 원", symbol: "₩" },
  USD: { name: "US Dollar", symbol: "$" },
  VND: { name: "Vietnamese Dong", symbol: "₫" },
  MYR: { name: "Malaysian Ringgit", symbol: "RM" },
  PHP: { name: "Philippine Peso", symbol: "₱" },
  IDR: { name: "Indonesian Rupiah", symbol: "Rp" },
  UZS: { name: "Uzbek Som", symbol: "soʻm" },
  GEL: { name: "Georgian Lari", symbol: "₾" },
};

/** Approximate KRW per 1 unit of currency — fallback only, replace with live rates. */
const FALLBACK_KRW_RATES: Record<CurrencyCode, number> = {
  KRW: 1,
  USD: 1380,
  VND: 0.055,
  MYR: 310,
  PHP: 24,
  IDR: 0.085,
  UZS: 0.11,
  GEL: 510,
};

export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: Partial<Record<CurrencyCode, number>> = {},
): number {
  const krwPerFrom = rates[from] ?? FALLBACK_KRW_RATES[from];
  const krwPerTo = rates[to] ?? FALLBACK_KRW_RATES[to];
  if (!krwPerFrom || !krwPerTo) {
    throw new Error(`Unknown currency pair ${from}/${to}`);
  }
  return (amount * krwPerFrom) / krwPerTo;
}

export function toKrw(amount: number, from: CurrencyCode): number {
  return convert(amount, from, "KRW");
}

export function formatMoney(amount: number, currency: CurrencyCode, locale = "ko-KR"): string {
  const zeroDecimal: CurrencyCode[] = ["KRW", "VND", "IDR", "UZS"];
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: zeroDecimal.includes(currency) ? 0 : 2,
  }).format(amount);
}
