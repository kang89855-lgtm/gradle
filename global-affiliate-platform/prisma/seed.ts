import { PrismaClient } from "@prisma/client";
import { allCountries } from "../src/config/countries";
import { staticOffers } from "../src/config/offers";
import { CURRENCY_INFO, type CurrencyCode } from "../src/lib/currency/exchange";

const prisma = new PrismaClient();

const LANGUAGES = [
  { code: "ko", name: "Korean" },
  { code: "en", name: "English" },
  { code: "vi", name: "Vietnamese" },
  { code: "ms", name: "Malay" },
  { code: "id", name: "Indonesian" },
];

const PROVIDERS = [
  { slug: "booking", name: "Booking.com Affiliate Partner", credentialEnvVar: "AFFILIATE_BOOKING_AID" },
  { slug: "agoda", name: "Agoda Affiliate Partner", credentialEnvVar: "AFFILIATE_AGODA_CID" },
  { slug: "klook", name: "Klook Affiliate Program", credentialEnvVar: "AFFILIATE_KLOOK_AID" },
  { slug: "getyourguide", name: "GetYourGuide Partner Program", credentialEnvVar: "AFFILIATE_GYG_PARTNER_ID" },
];

async function main() {
  for (const lang of LANGUAGES) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name },
      create: lang,
    });
  }

  for (const [code, info] of Object.entries(CURRENCY_INFO)) {
    await prisma.currency.upsert({
      where: { code },
      update: { name: info.name, symbol: info.symbol },
      create: { code: code as CurrencyCode, name: info.name, symbol: info.symbol },
    });
  }

  for (const provider of PROVIDERS) {
    await prisma.affiliateProvider.upsert({
      where: { slug: provider.slug },
      update: { name: provider.name, credentialEnvVar: provider.credentialEnvVar },
      create: provider,
    });
  }

  for (const strategy of allCountries) {
    const country = await prisma.country.upsert({
      where: { code: strategy.code },
      update: {
        name: strategy.name,
        nameKo: strategy.nameKo,
        phase: strategy.phase,
        enabled: strategy.enabled,
        tourismDemand: strategy.marketScore.tourismDemand,
        paymentGrowth: strategy.marketScore.digitalPaymentGrowth,
        purchasingPower: strategy.marketScore.purchasingPower,
        competitionLevel: 10 - strategy.marketScore.competitionOpportunity,
        affiliateCoverage: strategy.marketScore.affiliateAvailability,
      },
      create: {
        code: strategy.code,
        name: strategy.name,
        nameKo: strategy.nameKo,
        phase: strategy.phase,
        enabled: strategy.enabled,
        tourismDemand: strategy.marketScore.tourismDemand,
        paymentGrowth: strategy.marketScore.digitalPaymentGrowth,
        purchasingPower: strategy.marketScore.purchasingPower,
        competitionLevel: 10 - strategy.marketScore.competitionOpportunity,
        affiliateCoverage: strategy.marketScore.affiliateAvailability,
      },
    });

    for (const [index, city] of strategy.targetCities.entries()) {
      await prisma.destination.upsert({
        where: { countryId_slug: { countryId: country.id, slug: city.slug } },
        update: { name: city.name, nameKo: city.nameKo, priority: index },
        create: {
          countryId: country.id,
          slug: city.slug,
          name: city.name,
          nameKo: city.nameKo,
          priority: index,
        },
      });
    }
  }

  // Static catalog → Offer + AffiliateLink rows so /go/<slug> click logging works.
  for (const offer of staticOffers) {
    const country = await prisma.country.findUnique({ where: { code: offer.countryCode } });
    if (!country) continue;
    const destination = await prisma.destination.findUnique({
      where: { countryId_slug: { countryId: country.id, slug: offer.destinationSlug } },
    });

    const dbOffer = await prisma.offer.upsert({
      where: { slug: offer.slug },
      update: { title: offer.title.ko, landingUrl: offer.landingUrl },
      create: {
        slug: offer.slug,
        title: offer.title.ko,
        category: offer.category,
        landingUrl: offer.landingUrl,
        countryId: country.id,
        destinationId: destination?.id,
      },
    });

    await prisma.affiliateLink.upsert({
      where: { slug: offer.slug },
      update: {},
      create: {
        slug: offer.slug,
        offerId: dbOffer.id,
        subId: `${offer.countryCode.toLowerCase()}-${offer.destinationSlug}-${offer.category}`,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
