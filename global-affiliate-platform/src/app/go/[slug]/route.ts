import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { getOfferBySlug } from "@/config/offers";
import { getAdapter } from "@/lib/affiliate/adapters";
import { getDb } from "@/lib/db";
import { getCountryByCode } from "@/config/countries";

export const dynamic = "force-dynamic";

/**
 * Click-tracking redirect: /go/<offer-slug>?loc=ko
 *
 * 1. Resolve the offer from the static catalog.
 * 2. Build the affiliate deep link server-side (credentials stay on the server).
 * 3. Best-effort click logging — analytics failures must never block the visitor.
 * 4. 302 to the provider.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const offer = getOfferBySlug(slug);
  if (!offer) {
    return NextResponse.json({ error: "unknown offer" }, { status: 404 });
  }

  const locale = request.nextUrl.searchParams.get("loc") ?? "ko";
  const country = getCountryByCode(offer.countryCode);
  const adapter = getAdapter(offer.providerSlug);

  const subId = `${offer.countryCode.toLowerCase()}-${offer.destinationSlug}-${offer.category}`;
  const targetUrl =
    adapter && adapter.isConfigured()
      ? adapter.buildDeepLink({
          landingUrl: offer.landingUrl,
          subId,
          locale,
          currency: country?.localCurrency,
        })
      : // Unconfigured provider: send the visitor through anyway (no commission)
        offer.landingUrl;

  await recordClick(request, slug, locale).catch(() => {
    // swallow: logging must not break the redirect
  });

  return NextResponse.redirect(targetUrl, 302);
}

async function recordClick(request: NextRequest, offerSlug: string, locale: string) {
  const db = getDb();
  if (!db) return;

  const salt = process.env.CLICK_HASH_SALT ?? "";
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "";
  // privacy: only a salted hash is persisted, never the raw IP / UA
  const visitorHash = createHash("sha256").update(`${salt}:${ip}:${ua}`).digest("hex");

  const link = await db.affiliateLink.findUnique({ where: { slug: offerSlug } });
  if (!link) return;

  await db.clickEvent.create({
    data: {
      linkId: link.id,
      locale,
      referer: request.headers.get("referer")?.slice(0, 500) ?? null,
      visitorHash,
      utmSource: request.nextUrl.searchParams.get("utm_source"),
      utmMedium: request.nextUrl.searchParams.get("utm_medium"),
      utmCampaign: request.nextUrl.searchParams.get("utm_campaign"),
    },
  });
}
