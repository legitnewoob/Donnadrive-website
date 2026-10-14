import { useQuery } from "@tanstack/react-query";
import { plans as builtInPlans } from "@/components/Pricing/plans";

const API_BASE = import.meta.env.VITE_API_URL;

export interface LiveSale {
  name: string;
  percentOff: number | null;
  amountOff: number | null;
  amount: number;
  label: string;
  endsAt: string;
}

export interface LivePlan {
  slug: string;
  name: string;
  subtitle: string;
  features: string[];
  popular: boolean;
  button: string;
  amount: number; // pence
  currency: string;
  interval: "month" | "year";
  trialDays: number;
  includedSeats: number;
  extraSeatAmount: number;
  sale: LiveSale | null;
}

export interface LivePricing {
  plans: LivePlan[];
  sale: { name: string; bannerText: string; endsAt: string; plans: string[] } | null;
}

/** "£10", "£12.50" */
export const gbp = (pence: number) => `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`;

async function fetchPricing(): Promise<LivePricing> {
  const res = await fetch(`${API_BASE}/api/pricing`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load pricing");
  return data.data;
}

/** Prices, features and any sale, as set in the admin panel. */
export function usePricing() {
  return useQuery({ queryKey: ["pricing"], queryFn: fetchPricing, staleTime: 60_000, retry: 1 });
}

export type DisplayPlan = (typeof builtInPlans)[number] & {
  amount: number | null;
  sale: LiveSale | null;
  trialDays: number;
  includedSeats: number;
  extraSeatAmount: number;
};

/**
 * The pricing cards: the live plan from the API laid over the built-in one
 * (which keeps icons and links, and is the fallback if the API is down).
 */
export function useDisplayPlans(): { plans: DisplayPlan[]; sale: LivePricing["sale"]; trialDays: number } {
  const { data } = usePricing();
  const bySlug = Object.fromEntries((data?.plans || []).map((p) => [p.slug, p]));
  const plans = builtInPlans.map((base) => {
    const live = bySlug[base.slug];
    if (!live) {
      return { ...base, amount: null, sale: null, trialDays: base.slug === "pdi" ? 0 : 30, includedSeats: base.slug === "driving-school" ? 3 : 0, extraSeatAmount: base.slug === "driving-school" ? 1000 : 0 };
    }
    return {
      ...base,
      title: live.name,
      subtitle: live.subtitle,
      features: live.features.length ? live.features : base.features,
      popular: live.popular,
      button: live.button || base.button,
      price: live.amount > 0 ? gbp(live.amount) : "Free",
      period: live.amount > 0 ? `/${live.interval}` : "",
      amount: live.amount,
      sale: live.sale,
      trialDays: live.trialDays,
      includedSeats: live.includedSeats,
      extraSeatAmount: live.extraSeatAmount,
    };
  });
  const trialDays = Math.max(0, ...plans.map((p) => p.trialDays));
  return { plans, sale: data?.sale ?? null, trialDays };
}
