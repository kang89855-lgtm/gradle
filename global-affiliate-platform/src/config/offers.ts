import type { CountryCode, OfferCategory } from "@/config/countries/types";

/**
 * Phase-1 static offer catalog.
 *
 * Each entry links to the provider's own city/category landing page — never a
 * fabricated product. Prices are intentionally absent here: showing a price we
 * cannot guarantee would violate the price-accuracy rule. Live offers with
 * verified prices move into the Offer table via the admin flow.
 */
export interface StaticOffer {
  slug: string; // public /go/<slug> identifier
  providerSlug: string;
  countryCode: CountryCode;
  destinationSlug: string;
  category: OfferCategory;
  landingUrl: string;
  title: { ko: string; en: string };
  freeCancellationFilter?: boolean; // link pre-filtered to free-cancellation stays
}

export const staticOffers: StaticOffer[] = [
  // ── Vietnam ────────────────────────────────────────────────────────────────
  {
    slug: "vn-can-tho-hotels-booking",
    providerSlug: "booking",
    countryCode: "VN",
    destinationSlug: "can-tho",
    category: "hotels",
    landingUrl: "https://www.booking.com/city/vn/can-tho.html",
    title: { ko: "껀터 호텔 검색 (Booking.com)", en: "Can Tho hotels on Booking.com" },
  },
  {
    slug: "vn-can-tho-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "VN",
    destinationSlug: "can-tho",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/can-tho-vn.html",
    title: { ko: "껀터 호텔 검색 (Agoda)", en: "Can Tho hotels on Agoda" },
  },
  {
    slug: "vn-can-tho-tours-klook",
    providerSlug: "klook",
    countryCode: "VN",
    destinationSlug: "can-tho",
    category: "local-tours",
    landingUrl: "https://www.klook.com/search/?query=Can%20Tho",
    title: { ko: "껀터 메콩강 투어 검색 (Klook)", en: "Can Tho Mekong tours on Klook" },
  },
  {
    slug: "vn-quy-nhon-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "VN",
    destinationSlug: "quy-nhon",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/quy-nhon-vn.html",
    title: { ko: "꾸이년 호텔 검색 (Agoda)", en: "Quy Nhon hotels on Agoda" },
  },
  {
    slug: "vn-ninh-binh-tours-gyg",
    providerSlug: "getyourguide",
    countryCode: "VN",
    destinationSlug: "ninh-binh",
    category: "local-tours",
    landingUrl: "https://www.getyourguide.com/s/?q=Ninh%20Binh",
    title: { ko: "닌빈 당일투어 검색 (GetYourGuide)", en: "Ninh Binh day tours on GetYourGuide" },
  },
  {
    slug: "vn-hai-phong-hotels-booking",
    providerSlug: "booking",
    countryCode: "VN",
    destinationSlug: "hai-phong",
    category: "hotels",
    landingUrl: "https://www.booking.com/city/vn/haiphong.html",
    title: { ko: "하이퐁 호텔 검색 (Booking.com)", en: "Hai Phong hotels on Booking.com" },
  },
  {
    slug: "vn-buon-ma-thuot-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "VN",
    destinationSlug: "buon-ma-thuot",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/buon-ma-thuot-vn.html",
    title: { ko: "부온마투옷 호텔 검색 (Agoda)", en: "Buon Ma Thuot hotels on Agoda" },
  },

  // ── Malaysia ───────────────────────────────────────────────────────────────
  {
    slug: "my-ipoh-hotels-booking",
    providerSlug: "booking",
    countryCode: "MY",
    destinationSlug: "ipoh",
    category: "hotels",
    landingUrl: "https://www.booking.com/city/my/ipoh.html",
    title: { ko: "이포 호텔 검색 (Booking.com)", en: "Ipoh hotels on Booking.com" },
  },
  {
    slug: "my-kuching-tours-klook",
    providerSlug: "klook",
    countryCode: "MY",
    destinationSlug: "kuching",
    category: "local-tours",
    landingUrl: "https://www.klook.com/search/?query=Kuching",
    title: { ko: "쿠칭 보르네오 투어 검색 (Klook)", en: "Kuching Borneo tours on Klook" },
  },
  {
    slug: "my-johor-bahru-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "MY",
    destinationSlug: "johor-bahru",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/johor-bahru-my.html",
    title: { ko: "조호르바루 호텔 검색 (Agoda)", en: "Johor Bahru hotels on Agoda" },
  },
  {
    slug: "my-langkawi-tours-gyg",
    providerSlug: "getyourguide",
    countryCode: "MY",
    destinationSlug: "langkawi",
    category: "local-tours",
    landingUrl: "https://www.getyourguide.com/s/?q=Langkawi",
    title: { ko: "랑카위 액티비티 검색 (GetYourGuide)", en: "Langkawi activities on GetYourGuide" },
  },

  // ── Philippines ────────────────────────────────────────────────────────────
  {
    slug: "ph-iloilo-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "PH",
    destinationSlug: "iloilo",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/iloilo-ph.html",
    title: { ko: "일로일로 호텔 검색 (Agoda)", en: "Iloilo hotels on Agoda" },
  },
  {
    slug: "ph-dumaguete-hotels-booking",
    providerSlug: "booking",
    countryCode: "PH",
    destinationSlug: "dumaguete",
    category: "hotels",
    landingUrl: "https://www.booking.com/city/ph/dumaguete.html",
    title: { ko: "두마게테 호텔 검색 (Booking.com)", en: "Dumaguete hotels on Booking.com" },
  },
  {
    slug: "ph-davao-tours-klook",
    providerSlug: "klook",
    countryCode: "PH",
    destinationSlug: "davao",
    category: "local-tours",
    landingUrl: "https://www.klook.com/search/?query=Davao",
    title: { ko: "다바오 투어 검색 (Klook)", en: "Davao tours on Klook" },
  },
  {
    slug: "ph-siquijor-hotels-agoda",
    providerSlug: "agoda",
    countryCode: "PH",
    destinationSlug: "siquijor",
    category: "hotels",
    landingUrl: "https://www.agoda.com/city/siquijor-ph.html",
    title: { ko: "시키호르 숙소 검색 (Agoda)", en: "Siquijor stays on Agoda" },
  },
];

export function getOfferBySlug(slug: string): StaticOffer | undefined {
  return staticOffers.find((o) => o.slug === slug);
}

export function getOffersForDestination(
  countryCode: CountryCode,
  destinationSlug: string,
): StaticOffer[] {
  return staticOffers.filter(
    (o) => o.countryCode === countryCode && o.destinationSlug === destinationSlug,
  );
}
