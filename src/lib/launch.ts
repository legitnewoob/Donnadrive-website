// The launch waitlist: what mode the site is in (waitlist / invite / open), where
// a visitor came from (for referrals), and the visitor's own place on the list.
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export type LaunchMode = "waitlist" | "invite" | "open";

export interface Launch {
  mode: LaunchMode;
  /** YYYY-MM-DD, only while sign-up is closed and the day hasn't passed */
  date: string | null;
  message: string;
  count: number;
  joinedToday: number;
}

export interface WaitlistEntry {
  name: string;
  email: string;
  place: number;
  position: number;
  referralCode: string;
  referrals: number;
  referralsToPriority: number;
  priority: boolean;
  status: "waiting" | "invited" | "joined" | "removed";
  type: "adi" | "pdi" | "school" | null;
  schoolSize: "2-5" | "6-15" | "16+" | null;
  area: string;
  currentTool: string[];
  marketingConsent: boolean;
  token?: string;
}

export interface WaitlistStatus extends WaitlistEntry {
  friends: { name: string; joinedAt: string }[];
  launch: Launch;
}

/** The sign-up gate's reply when sign-up is closed (403 WAITLIST). */
export interface WaitlistBlock {
  onList: boolean;
  place: number | null;
  status: string | null;
  name: string;
  email: string;
}

/** Social proof only once it's flattering. */
export const SHOW_COUNT_FROM = 50;
export const PLACES_PER_REFERRAL = 10;

const safe = {
  get(store: Storage, key: string) {
    try {
      return store.getItem(key);
    } catch {
      return null;
    }
  },
  set(store: Storage, key: string, value: string) {
    try {
      store.setItem(key, value);
    } catch {
      /* private mode */
    }
  },
  remove(store: Storage, key: string) {
    try {
      store.removeItem(key);
    } catch {
      /* private mode */
    }
  },
};

// ── Launch mode ─────────────────────────────────────────────────────────

const LAUNCH_KEY = "dd_launch";
const envMode = (import.meta.env.VITE_LAUNCH_MODE as LaunchMode | undefined) || "open";
const fallback: Launch = { mode: envMode, date: null, message: "", count: 0, joinedToday: 0 };

function cachedLaunch(): Launch {
  const raw = safe.get(sessionStorage, LAUNCH_KEY);
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

let current: Launch = cachedLaunch();
let inflight: Promise<Launch> | null = null;
const listeners = new Set<(l: Launch) => void>();

export function refreshLaunch(): Promise<Launch> {
  if (!inflight) {
    inflight = fetch(`${API_BASE}/api/launch`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("launch"))))
      .then(({ data }) => {
        current = { ...fallback, ...data };
        safe.set(sessionStorage, LAUNCH_KEY, JSON.stringify(current));
        listeners.forEach((l) => l(current));
        return current;
      })
      .catch(() => current)
      .finally(() => {
        setTimeout(() => (inflight = null), 30_000);
      });
  }
  return inflight;
}

/**
 * The site's launch mode, banner and count. Shows the last known value straight
 * away (so buttons don't flicker) and refreshes it in the background.
 */
export function useLaunch(): Launch {
  const [launch, setLaunch] = useState<Launch>(current);
  useEffect(() => {
    listeners.add(setLaunch);
    refreshLaunch();
    return () => {
      listeners.delete(setLaunch);
    };
  }, []);
  return launch;
}

export const isClosed = (l: Launch) => l.mode !== "open";

// ── Where they came from ────────────────────────────────────────────────

const ATTR_KEY = "dd_attribution";
const REF_KEY = "dd_ref";

/** Remember ?ref= and UTM tags from the page someone landed on (first touch wins). */
export function captureAttribution() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref && /^[a-z0-9]{2,20}$/i.test(ref)) safe.set(localStorage, REF_KEY, ref.toLowerCase());
  if (safe.get(sessionStorage, ATTR_KEY)) return;
  const utm = Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign"].map((k) => [k, params.get(k) || ""]).filter(([, v]) => v)
  );
  const referrer = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
  safe.set(sessionStorage, ATTR_KEY, JSON.stringify({ ...utm, referrer, landingPath: window.location.pathname }));
}

export const referralCode = () => safe.get(localStorage, REF_KEY);

function attribution() {
  try {
    return JSON.parse(safe.get(sessionStorage, ATTR_KEY) || "{}");
  } catch {
    return {};
  }
}

// ── Their own place ─────────────────────────────────────────────────────

const ME_KEY = "dd_waitlist";

/** The private token for their status page, kept so returning visitors see their place. */
export const myWaitlistToken = () => safe.get(localStorage, ME_KEY);
export const rememberWaitlistToken = (token: string) => safe.set(localStorage, ME_KEY, token);
export const forgetWaitlistToken = () => safe.remove(localStorage, ME_KEY);

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || "Something went wrong. Please try again.") as Error & { code?: string; status?: number };
    err.code = body.code;
    err.status = res.status;
    throw err;
  }
  return body.data as T;
}

export type JoinResult =
  | { created: true; entry: WaitlistEntry }
  | { created: false; entry: { name: string; place: number; status: WaitlistEntry["status"] } };

export async function joinWaitlist(input: { name: string; email: string; type?: string | null; website?: string }) {
  const result = await call<JoinResult>("/api/waitlist", {
    method: "POST",
    body: JSON.stringify({ ...input, ref: referralCode(), source: attribution() }),
  });
  if (result.created && result.entry.token) rememberWaitlistToken(result.entry.token);
  refreshLaunch();
  return result;
}

export const getWaitlistStatus = (token: string) => call<WaitlistStatus>(`/api/waitlist/me?t=${encodeURIComponent(token)}`);

export const updateWaitlistProfile = (token: string, data: Partial<Pick<WaitlistEntry, "type" | "schoolSize" | "area" | "currentTool" | "marketingConsent">>) =>
  call<WaitlistEntry>(`/api/waitlist/me?t=${encodeURIComponent(token)}`, { method: "PATCH", body: JSON.stringify(data) });

export interface InviteInfo {
  valid: boolean;
  name?: string;
  email?: string;
  expiresAt?: string;
  promo?: { code: string; label: string } | null;
}

export const getInviteInfo = (token: string) => call<InviteInfo>(`/api/waitlist/invite/${encodeURIComponent(token)}`);

// ── Sharing ─────────────────────────────────────────────────────────────

export const shareLink = (code: string) => `${window.location.origin}/?ref=${code}`;

export const shareText =
  "I've joined the waitlist for Donna Drive, an assistant that books driving lessons for you on WhatsApp. Join with my link:";

/** "Mon 3 Nov" */
export const launchDay = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
