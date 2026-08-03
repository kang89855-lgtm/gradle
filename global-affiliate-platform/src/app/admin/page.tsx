import type { Metadata } from "next";
import { allCountries } from "@/config/countries";
import { calculateMarketPriority, MARKET_WEIGHTS } from "@/lib/market/priority";
import { staticOffers } from "@/config/offers";

export const metadata: Metadata = {
  title: "Admin · Market Priority",
  robots: { index: false, follow: false },
};

// NOTE: authentication middleware is a Phase 2 item; until then this page
// exposes only strategy configuration (no revenue or personal data).
export default function AdminDashboard() {
  const rows = allCountries
    .map((country) => ({
      country,
      priority: calculateMarketPriority({
        tourismDemand: country.marketScore.tourismDemand,
        paymentGrowth: country.marketScore.digitalPaymentGrowth,
        purchasingPower: country.marketScore.purchasingPower,
        competitionLevel: 10 - country.marketScore.competitionOpportunity,
        affiliateCoverage: country.marketScore.affiliateAvailability,
        // static assumption until per-country cost tracking lands
        contentProductionCost: 5,
      }),
      offerCount: staticOffers.filter((o) => o.countryCode === country.code).length,
    }))
    .sort((a, b) => b.priority - a.priority);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">시장 우선순위 대시보드</h1>
      <p className="mb-8 text-sm text-slate-500">
        가중치: 관광수요 {MARKET_WEIGHTS.tourismDemand * 100}% · 결제성장{" "}
        {MARKET_WEIGHTS.paymentGrowth * 100}% · 구매력{" "}
        {MARKET_WEIGHTS.purchasingPower * 100}% · 저경쟁 기회{" "}
        {MARKET_WEIGHTS.competitionOpportunity * 100}% · 제휴 재고{" "}
        {MARKET_WEIGHTS.affiliateCoverage * 100}% · 제작비 효율{" "}
        {MARKET_WEIGHTS.costEfficiency * 100}%
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-left dark:border-slate-700">
              <th className="p-2">순위</th>
              <th className="p-2">국가</th>
              <th className="p-2">단계</th>
              <th className="p-2">상태</th>
              <th className="p-2">우선순위 점수</th>
              <th className="p-2">공략 도시</th>
              <th className="p-2">등록 상품</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ country, priority, offerCount }, i) => (
              <tr
                key={country.code}
                className="border-b border-slate-200 dark:border-slate-800"
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-medium">
                  {country.nameKo} ({country.code})
                </td>
                <td className="p-2">Phase {country.phase}</td>
                <td className="p-2">
                  {country.enabled ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900 dark:text-green-200">
                      운영 중
                    </span>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      대기
                    </span>
                  )}
                </td>
                <td className="p-2 font-mono">{priority.toFixed(2)}</td>
                <td className="p-2">
                  {country.targetCities.map((c) => c.nameKo).join(", ")}
                </td>
                <td className="p-2">{offerCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
