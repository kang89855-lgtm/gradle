import { getDictionary } from "@/lib/i18n";

/**
 * Compliance engine (phase 1): every monetized page must render an affiliate
 * disclosure in the page language, above the first affiliate link.
 * Country-specific rules load from the ComplianceRule table in later phases;
 * the locale default below is the guaranteed minimum.
 */
export function getDisclosure(locale: string): { title: string; body: string } {
  const dict = getDictionary(locale);
  return { title: dict.disclosureTitle, body: dict.disclosureBody };
}
