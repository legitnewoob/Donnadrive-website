import { setAccess, type SchoolInfo } from "./access";

const API_BASE = import.meta.env.VITE_API_URL;

export async function googleSignup(credential: string, plan: string) {
  const res = await fetch(`${API_BASE}/api/auth/google-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, plan }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Signup failed");
  return data as {
    success: boolean;
    token: string;
    apiKey: string | null;
    instructor: { name: string; email: string; plan: string; subscriptionStatus: string | null };
    access?: { staffRole: "admin" | "support" | null; superAdmin: boolean; permissions: string[] };
    needsPlan?: boolean;
    school?: SchoolInfo | null;
    isNew: boolean;
  };
}

/** embedded: Stripe's checkout shown inside our modal (returns clientSecret) instead of a redirect (url) */
export async function createCheckoutSession(token: string, plan: string, { embedded = false } = {}) {
  const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan, embedded }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
  return data as { success: boolean; url: string | null; clientSecret: string | null };
}

/** Pick the free plan (paid plans are picked by finishing checkout) */
export async function chooseFreePlan(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/choose-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan: "pdi" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Couldn't choose the plan");
  return data as { success: boolean; plan: string };
}

export async function exchangeAuthCode(code: string, sessionId?: string | null) {
  const res = await fetch(`${API_BASE}/api/auth/exchange-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, sessionId: sessionId || undefined }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Code exchange failed");
  return data as {
    success: boolean;
    token: string;
    apiKey: string;
    instructor: { name: string; email: string; plan: string; subscriptionStatus: string | null };
  };
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
  if (data.instructor?.access) {
    setAccess({ ...data.instructor.access, needsPlan: !!data.instructor.needsPlan, school: data.instructor.school ?? null });
  }
  return data.instructor as {
    name: string;
    email: string;
    plan: string;
    subscriptionStatus: string | null;
    phoneNumber: string | null;
    phoneNumberId: string | null;
    onboardingComplete: boolean;
    onboardingStatus: { phoneAssigned: boolean; subscriptionActive: boolean; calendarConnected: boolean; calendarTokenExpired?: boolean };
    school?: SchoolInfo | null;
    access?: { staffRole: "admin" | "support" | null; superAdmin: boolean; permissions: string[] };
    comp?: { plan: string; until: string | null } | null;
    needsPlan?: boolean;
    /** Picked a paid plan but didn't finish paying */
    pendingPlan?: "adi" | "driving-school" | null;
  };
}

export async function requestPhoneNumber(token: string) {
  const res = await fetch(`${API_BASE}/api/phone-numbers/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to request phone number");
  return data as { success: boolean; phoneNumber: string; phoneNumberId: string };
}

export async function updateProfile(token: string, data: { name?: string; timezone?: string }) {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update profile");
  return json;
}

export async function deleteAccount(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ confirmation: "DELETE" }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete account");
  return json;
}

export async function getInvoices(token: string, limit = 10) {
  const res = await fetch(`${API_BASE}/api/stripe/invoices?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to fetch invoices");
  return json as { invoices: Array<{ id: string; amount: number; status: string; date: string; description: string; pdfUrl: string | null }> };
}

export async function createPortalSession(token: string) {
  const res = await fetch(`${API_BASE}/api/stripe/create-portal-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to create portal session");
  return json as { url: string };
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export async function getCalendarConnectUrl(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/calendar/connect`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get calendar URL");
  return data as { success: boolean; url: string };
}

export async function disconnectCalendar(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/calendar/disconnect`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to disconnect calendar");
  return data;
}

// ─── Learners ───────────────────────────────────────────────────────────────

export async function getLearners(token: string, search?: string, instructor?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (instructor) params.set("instructor", instructor);
  const q = params.toString() ? `?${params}` : "";
  const res = await fetch(`${API_BASE}/api/dashboard/learners${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch learners");
  return data.data as Array<{
    phone: string; name: string | null; age: number | null; postalCode: string | null;
    instructorNotes: string; createdAt: string | null;
    lessonsCompleted: number; nextLesson: { date: string; time: string } | null;
    totalPaid: number; totalCharged: number; outstanding: number; credit: number;
    paymentStatus: "paid" | "owes"; progressLevel: "new" | "active" | "test-ready";
    priority: boolean; donnaPaused: boolean;
  }>;
}

export async function getLearnerDetail(token: string, phone: string, instructor?: string) {
  const q = instructor ? `?instructor=${encodeURIComponent(instructor)}` : "";
  const res = await fetch(`${API_BASE}/api/dashboard/learners/${encodeURIComponent(phone)}${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch learner");
  return data.data as {
    phone: string; name: string | null; age: number | null; dob: string | null;
    postalCode: string | null; instructorNotes: string; createdAt: string | null;
    schedulingPrefs: SchedulingPrefs;
    lessonsCompleted: number; totalPaid: number; totalCharged: number; outstanding: number; credit: number;
    lessons: Array<{
      bookingId: string; date: string; time: string; status: string;
      topicsCovered: string[]; rating: number | null; progressNotes: string;
      paymentReceived: boolean; paymentAmount: number;
      lessonTypeName: string; price: number | null; lateCancellation: boolean;
    }>;
    payments: Array<{ paymentId: string; amount: number; method: string; date: string; note: string }>;
  };
}

export async function updateLearnerNotes(token: string, phone: string, notes: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/learners/${encodeURIComponent(phone)}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update notes");
  return data;
}

export interface SchedulingPrefs {
  priority: boolean;
  maxAddedDriveMin: number | null;
  savedPlaces: Array<{ label: string; address: string; located?: boolean }>;
  preferredDays: number[];
  preferredTimes: string[];
  unavailable: Array<{ days: number[]; from: string; to: string }>;
  defaultLessonTypeId: string | null;
  maxLessonsPerWeek: number | null;
  donnaPaused: boolean;
}

export async function updateLearnerPreferences(token: string, phone: string, prefs: Partial<SchedulingPrefs>) {
  const res = await fetch(`${API_BASE}/api/dashboard/learners/${encodeURIComponent(phone)}/preferences`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(prefs),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save preferences");
  return data.data as SchedulingPrefs;
}

// ─── Donna Settings ─────────────────────────────────────────────────────────

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type RoutePreset = "off" | "relaxed" | "balanced" | "tight" | "custom";

export interface RouteSettings {
  preset: RoutePreset;
  lessonDurationMin: number;
  travelGraceMin: number;
  maxAddedDriveMin: number;
  homeLegWeight: "off" | "half" | "full";
  fragmentationPenalty: "off" | "low" | "medium" | "high";
  serviceArea: { radius: number | null; unit: "miles" | "km"; postcodeDistricts: string[] };
  suggestOtherDays: boolean;
  lookAheadDays: number;
}

export interface BotSettings {
  /** Master switch: off = Donna stops replying and booking */
  donnaEnabled: boolean;
  workingHours: Record<DayKey, string[]>;
  breaks: Array<{ from: string; to: string }>;
  maxLessonsPerDay: number | null;
  minNoticeHours: number;
  bookingWindowDays: number;
  holiday: { enabled: boolean; from: string | null; to: string | null; message: string };
  acceptingNewLearners: boolean;
  allowCancel: boolean;
  allowReschedule: boolean;
  tone: "friendly" | "professional" | "brief";
  emojis: boolean;
  customGreeting: string;
  aboutLessons: string;
  cancellationNoticeHours: number;
  lateCancellationFee: number | null;
  reminders: "off" | "24h" | "24h+2h";
  notifications: { booked: boolean; cancelled: boolean; rescheduled: boolean; email: boolean };
  handover: boolean;
}

export interface SetupStatus {
  complete: boolean;
  required: Array<{ key: string; label: string; done: boolean; link: string }>;
  missing: string[];
  hasNumber: boolean;
  calendarConnected: boolean;
}

// Pages fire this after saving anything that can change the setup checklist
export const SETUP_CHANGED_EVENT = "dd_setup_change";
export const notifySetupChanged = () => window.dispatchEvent(new Event(SETUP_CHANGED_EVENT));

export async function getSetupStatus(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/setup-status`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load setup status");
  return data.data as SetupStatus;
}

export interface DonnaSettings {
  setup?: SetupStatus;
  /** Their driving school has switched Donna off for everyone */
  donnaOffBySchool?: boolean;
  baseAddress: string;
  hasBaseLocation: boolean;
  routeSettings: RouteSettings;
  botSettings: BotSettings;
  presets: Record<string, { enabled?: boolean; maxAddedDriveMin?: number; travelGraceMin?: number; fragmentationPenalty?: string }>;
}

export async function getSettings(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load settings");
  return data.data as DonnaSettings;
}

export async function updateSettings(
  token: string,
  body: { baseAddress?: string; routeSettings?: Partial<RouteSettings>; botSettings?: Partial<BotSettings> }
) {
  const res = await fetch(`${API_BASE}/api/dashboard/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to save settings");
  return data.data as DonnaSettings;
}

export interface RoutePreview {
  date: string;
  location: string;
  hasBaseLocation: boolean;
  serviceArea: { inside: boolean; reason?: string };
  closedReason: "not_working_day" | "holiday" | "day_full" | null;
  freeSlots: string[];
  offered: string[];
  usedFallback?: boolean;
  slots: Array<{ slot: string; feasible: boolean; addedDriveMin: number | null; reason: string; offered: boolean }>;
}

export async function previewRoute(
  token: string,
  body: { date: string; address: string; routeSettings?: Partial<RouteSettings> }
) {
  const res = await fetch(`${API_BASE}/api/dashboard/route-preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to preview");
  return data.data as RoutePreview;
}

// ─── Lesson Types ───────────────────────────────────────────────────────────

export async function getLessonTypes(token: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch lesson types");
  return data.data as Array<{
    _id: string; name: string; price: number; description: string;
    active: boolean; sortOrder: number;
  }>;
}

export async function createLessonType(token: string, body: { name: string; price: number; description?: string }) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create lesson type");
  return data.data;
}

export async function updateLessonType(token: string, id: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update lesson type");
  return data.data;
}

export async function deleteLessonType(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete lesson type");
  return data;
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export async function getDashboard(token: string, range = "This week") {
  const res = await fetch(`${API_BASE}/api/dashboard?range=${encodeURIComponent(range)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch dashboard");
  return data.data as {
    user: { name: string; firstName: string; initials: string; email: string; phoneNumberId: string; calendarConnected: boolean };
    stats: Array<{ title: string; value: string; change: string; icon: string; color: string; bgColor: string }>;
    todaySchedule: Array<{ student: string; time: string; duration: string; status: string }>;
    upcomingLessons: Array<{ student: string; time: string; status: string }>;
    revenueData: Array<{ name: string; revenue: number }>;
    lessonData: Array<{ name: string; value: number; color: string }>;
    studentGrowth: Array<{ name: string; students: number }>;
    activity: Array<{ text: string; time: string; icon: string }>;
    revenueGoal: { current: number; target: number };
  };
}

// ─── Driving school ─────────────────────────────────────────────────────────

export interface SchoolMember {
  id: string;
  name: string;
  email: string;
  role: "member" | "manager";
  roleLabel: string | null;
  phoneNumber: string | null;
  calendarConnected: boolean;
  donnaEnabled: boolean;
  setup: SetupStatus;
  learners: number;
  lessonsThisWeek: number;
  upcomingLessons: number;
  joinedAt: string | null;
}

export interface SchoolOverview {
  school: { id: string; name: string; seatLimit: number; includedSeats: number; extraSeats: number; planAmount: number; extraSeatAmount: number; canBuySeats: boolean };
  role: "owner" | "manager" | "member";
  roleLabel: string | null;
  permissions: string[];
  owner: { name: string; email: string } | null;
  seats: { members: number; invites: number; used: number; limit: number };
  members: SchoolMember[];
  invites: Array<{ id: string; email: string; sentAt: string; expiresAt: string; link: string }>;
  /** The school-wide switch: off stops Donna for every instructor */
  donnaEnabled: boolean;
  /** Onboarded once an instructor has joined and set Donna up completely */
  onboarding: { invited: boolean; joined: boolean; ready: boolean; complete: boolean; readyCount: number };
}

async function schoolRequest<T>(token: string | null, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}/api/school${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Something went wrong"), { code: data.code, status: res.status });
  return data.data as T;
}

export const getSchool = (token: string) => schoolRequest<SchoolOverview>(token, "");
export const setSchoolDonna = (token: string, enabled: boolean) =>
  schoolRequest<SchoolOverview>(token, "/donna", { method: "PUT", body: JSON.stringify({ enabled }) });
export const renameSchool = (token: string, name: string) =>
  schoolRequest<SchoolOverview>(token, "", { method: "PATCH", body: JSON.stringify({ name }) });
export const inviteInstructor = (token: string, email: string) =>
  schoolRequest<{ email: string; link: string; emailed: boolean; alreadySent: boolean }>(token, "/invites", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
export const cancelSchoolInvite = (token: string, id: string) => schoolRequest<void>(token, `/invites/${id}`, { method: "DELETE" });
// Extra instructor seats on top of the ones included (prorated)
export const setSchoolSeats = (token: string, extraSeats: number) =>
  schoolRequest<SchoolOverview>(token, "/seats", { method: "PUT", body: JSON.stringify({ extraSeats }) });
export const removeSchoolMember = (token: string, id: string) => schoolRequest<{ id: string; name: string }>(token, `/members/${id}`, { method: "DELETE" });
export const setSchoolMemberRole = (token: string, id: string, role: "manager" | "instructor") =>
  schoolRequest<{ id: string; name: string; role: string; roleLabel: string }>(token, `/members/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
export const getSchoolInvite = (inviteToken: string) =>
  schoolRequest<{ schoolName: string; ownerName: string | null; email: string; expiresAt: string }>(null, `/invites/${inviteToken}`);
export const acceptSchoolInvite = (token: string, inviteToken: string) =>
  schoolRequest<{ schoolName: string; hadOwnSubscription: boolean }>(token, `/invites/${inviteToken}/accept`, { method: "POST" });

// Website "Contact us" form: emails the team, who reply to the address given
export async function sendContactMessage(body: { name: string; email: string; message: string; website?: string }) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't send your message");
}
