const API_BASE = import.meta.env.VITE_API_URL;

export type StaffRole = "admin" | "support";

export interface StaffMe {
  email: string;
  id?: string;
  role: StaffRole;
  permissions: string[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  plan: "pdi" | "adi" | "driving-school";
  status: string;
  subscriptionStatus: string | null;
  schoolRole: "owner" | "manager" | "member" | null;
  staffRole: StaffRole | null;
  superAdmin: boolean;
  hasNumber: boolean;
  phone: string | null;
  calendarConnected: boolean;
  donnaEnabled: boolean;
  comp: { plan: string; until: string | null; note?: string } | null;
  trialEndsAt: string | null;
  active: boolean;
  suspended: boolean;
  createdAt: string;
}

export interface CustomerDetail extends CustomerRow {
  timezone: string;
  setup: { complete: boolean; required: Array<{ key: string; label: string; done: boolean }> };
  usage: { learners: number; lessonsTotal: number; upcoming: number; lastLessonDate: string | null };
  school: { id: string; name: string; role: string; seatLimit: number; extraSeats: number } | null;
  number: { phoneNumber: string; region: string; assignedAt: string } | null;
  stripe: { customerId: string; subscriptionId: string | null; url: string } | null;
  history: AuditEntry[];
}

export interface AuditEntry {
  _id: string;
  actor: string;
  action: string;
  target: string | null;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface Overview {
  instructors: { total: number; byPlan: Record<string, number>; suspended: number };
  revenue: { mrr: number; arr: number; paying: number; trialing: number; pastDue: number; comped: number; canceledLast30: number; currency: string };
  signups: Array<{ date: string; count: number }>;
  signupsLast30: number;
  funnel: Array<{ key: string; label: string; count: number }>;
  donnaOff: number;
  schools: { total: number; instructors: number; seats: number; extraSeats: number };
  numbers: { available: number; assigned: number; reserved: number };
  lessons: { next7Days: number; last30Days: number };
  learners: number;
  recentSignups: CustomerRow[];
  trialsEnding: CustomerRow[];
}

export interface AdminPlan {
  _id: string;
  slug: string;
  name: string;
  subtitle: string;
  features: string[];
  popular: boolean;
  button: string;
  amount: number;
  currency: string;
  interval: "month" | "year";
  trialDays: number;
  stripePriceId: string | null;
  includedSeats: number;
  extraSeatAmount: number;
  extraSeatPriceId: string | null;
  sortOrder: number;
}

export interface PriceChange {
  _id: string;
  plan: string;
  kind: "base" | "seat";
  fromAmount: number;
  toAmount: number;
  effectiveAt: string;
  status: "scheduled" | "applied" | "cancelled";
  notified: number;
  migrated: number;
  failed: number;
  by?: string;
  createdAt: string;
}

export interface Discount {
  percentOff: number | null;
  amountOff: number | null;
  duration: "once" | "repeating" | "forever";
  durationMonths: number | null;
  plans: string[];
}

export interface Sale extends Discount {
  _id: string;
  name: string;
  bannerText: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
}

export interface PromoCode extends Discount {
  _id: string;
  code: string;
  maxRedemptions: number | null;
  expiresAt: string | null;
  active: boolean;
  timesRedeemed: number | null;
  createdAt: string;
}

export interface StaffMember {
  id: string | null;
  name: string | null;
  email: string;
  staffRole: StaffRole | null;
  superAdmin: boolean;
  signedUp: boolean;
}

export interface PoolNumber {
  _id: string;
  phoneNumber: string;
  phoneNumberId: string;
  status: "available" | "reserved" | "assigned";
  region: string;
  label: string | null;
  assignedTo: { _id: string; name: string; email: string } | null;
  assignedAt: string | null;
  createdAt: string;
}

export class AdminError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T & { pagination?: Pagination }> {
  const token = localStorage.getItem("dd_token");
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AdminError(data.error || "Something went wrong", res.status, data.code);
  return data;
}

const get = <T>(path: string) => request<{ data: T }>(path);
const send = <T>(method: string, path: string, body?: unknown) =>
  request<{ data: T }>(path, { method, ...(body !== undefined && { body: JSON.stringify(body) }) }).then((r) => r.data);

function qs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const adminApi = {
  me: () => get<StaffMe>("/me").then((r) => r.data),
  overview: () => get<Overview>("/overview").then((r) => r.data),

  customers: (p: { search?: string; plan?: string; status?: string; staff?: string; page?: number }) =>
    get<CustomerRow[]>(`/customers${qs(p)}`),
  customer: (id: string) => get<CustomerDetail>(`/customers/${id}`).then((r) => r.data),
  extendTrial: (id: string, days: number) => send<CustomerRow>("POST", `/customers/${id}/extend-trial`, { days }),
  comp: (id: string, body: { plan: string; until: string | null; note: string }) => send<CustomerRow>("PUT", `/customers/${id}/comp`, body),
  removeComp: (id: string) => send<CustomerRow>("DELETE", `/customers/${id}/comp`),
  suspend: (id: string) => send<CustomerRow>("POST", `/customers/${id}/suspend`),
  reactivate: (id: string) => send<CustomerRow>("POST", `/customers/${id}/reactivate`),

  staff: () => get<StaffMember[]>("/staff").then((r) => r.data),
  setStaff: (email: string, role: StaffRole | null) => send<StaffMember>("PUT", "/staff", { email, role }),

  plans: () => request<{ data: AdminPlan[]; noticeDays: number }>("/plans"),
  updatePlan: (slug: string, changes: Partial<AdminPlan>) =>
    send<{ plan: AdminPlan; priceChanges: PriceChange[] }>("PATCH", `/plans/${slug}`, changes),
  priceChanges: () => get<PriceChange[]>("/price-changes").then((r) => r.data),
  cancelPriceChange: (id: string) => send<PriceChange>("DELETE", `/price-changes/${id}`),

  sales: () => get<Sale[]>("/sales").then((r) => r.data),
  createSale: (body: Partial<Sale>) => send<Sale>("POST", "/sales", body),
  updateSale: (id: string, body: Partial<Sale>) => send<Sale>("PATCH", `/sales/${id}`, body),
  endSale: (id: string) => send<Sale>("DELETE", `/sales/${id}`),

  promoCodes: () => get<PromoCode[]>("/promo-codes").then((r) => r.data),
  createPromoCode: (body: Partial<PromoCode>) => send<PromoCode>("POST", "/promo-codes", body),
  deactivatePromoCode: (id: string) => send<PromoCode>("DELETE", `/promo-codes/${id}`),

  audit: (p: { page?: number; action?: string }) => get<AuditEntry[]>(`/audit${qs(p)}`),

  numbers: (status?: string) => get<PoolNumber[]>(`/phone-numbers${qs({ status, limit: 200 })}`),
  addNumber: (body: { phoneNumber: string; phoneNumberId: string; region?: string; label?: string; whatsappToken?: string }) =>
    request<{ added: number }>("/phone-numbers", { method: "POST", body: JSON.stringify(body) }),
  revokeNumber: (id: string) => request<object>(`/phone-numbers/${id}/revoke`, { method: "POST" }),
  deleteNumber: (id: string) => request<object>(`/phone-numbers/${id}`, { method: "DELETE" }),
};

export const gbp = (pence: number) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const PLAN_LABELS: Record<string, string> = { pdi: "PDI", adi: "ADI", "driving-school": "Driving School" };

export function describeDiscount(d: Discount) {
  const off = d.percentOff != null ? `${d.percentOff}% off` : `${gbp(d.amountOff || 0)} off`;
  const how = d.duration === "once" ? "first month" : d.duration === "forever" ? "forever" : `${d.durationMonths} months`;
  const plans = d.plans.length ? d.plans.map((p) => PLAN_LABELS[p] || p).join(", ") : "all paid plans";
  return `${off} · ${how} · ${plans}`;
}
