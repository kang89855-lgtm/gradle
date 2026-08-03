import type { ProviderAdapter } from "../types";
import { bookingAdapter } from "./booking";
import { agodaAdapter } from "./agoda";
import { klookAdapter } from "./klook";
import { getYourGuideAdapter } from "./getyourguide";

export const adapters: Record<string, ProviderAdapter> = {
  [bookingAdapter.slug]: bookingAdapter,
  [agodaAdapter.slug]: agodaAdapter,
  [klookAdapter.slug]: klookAdapter,
  [getYourGuideAdapter.slug]: getYourGuideAdapter,
};

export function getAdapter(slug: string): ProviderAdapter | undefined {
  return adapters[slug];
}
