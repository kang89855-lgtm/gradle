import type { CountryCode, CountryStrategy } from "./types";
import { vietnamStrategy } from "./vietnam";
import { malaysiaStrategy } from "./malaysia";
import { philippinesStrategy } from "./philippines";
import {
  indonesiaStrategy,
  uzbekistanStrategy,
  georgiaStrategy,
} from "./expansion";

export const allCountries: CountryStrategy[] = [
  vietnamStrategy,
  malaysiaStrategy,
  philippinesStrategy,
  indonesiaStrategy,
  uzbekistanStrategy,
  georgiaStrategy,
];

export const enabledCountries = allCountries.filter((c) => c.enabled);

export function getCountryByCode(code: CountryCode): CountryStrategy | undefined {
  return allCountries.find((c) => c.code === code);
}

export function getCountryBySlug(slug: string): CountryStrategy | undefined {
  return allCountries.find((c) => c.slug === slug);
}

export * from "./types";
