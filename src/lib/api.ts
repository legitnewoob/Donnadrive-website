import { setAccess, type SchoolInfo } from "./access";
import { referralCode, type WaitlistBlock } from "./launch";

// A launch invite opened on /join, used by the next Google sign-up
const INVITE_KEY = "dd_invite";
export const pendingInvite = () => {
  try {
    return sessionStorage.getItem(INVITE_KEY);
  } catch {
    return null;
  }
};
export const setPendingInvite = (token: string) => {
  try {
    sessionStorage.setItem(INVITE_KEY, token);
  } catch {
    /* private mode */
  }
};
const clearPendingInvite = () => {
  try {
    sessionStorage.removeItem(INVITE_KEY);
  } catch {
    /* private mode */
  }
};

const API_BASE = import.meta.env.VITE_API_URL;

/** Thrown when sign-up is closed and this Google account has no account yet. */
export class WaitlistError extends Error {
  constructor(public block: WaitlistBlock) {
    super("We're not open yet");
  }
}

/**
 * invite: a launch-waitlist invite token; ref: who referred them. Both are
 * picked up from the visit automatically when not given.
 */
export async function googleSignup(credential: string, plan: string, opts: { invite?: string | null; ref?: string | null } = {}) {
  const res = await fetch(`${API_BASE}/api/auth/google-signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential, plan, invite: opts.invite ?? pendingInvite(), ref: opts.ref ?? referralCode() }),
  });

  const data = await res.json();
  if (res.status === 403 && data.code === "WAITLIST") {
    throw new WaitlistError({ onList: !!data.onList, place: data.place ?? null, status: data.status ?? null, name: data.name || "", email: data.email || "" });
  }
  if (!res.ok) throw new Error(data.error || "Signup failed");
  clearPendingInvite();
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

/** Pick a free plan, one priced at £0 (paid plans are picked by finishing checkout) */
export async function chooseFreePlan(token: string, plan = "pdi") {
  const res = await fetch(`${API_BASE}/api/auth/choose-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plan }),
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
    pendingPlan?: string | null;
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

// `instructor`: a school owner acting for one of their instructors
const forInstructor = (instructor?: string) => (instructor ? `?instructor=${encodeURIComponent(instructor)}` : "");

export async function updateLearnerNotes(token: string, phone: string, notes: string, instructor?: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/learners/${encodeURIComponent(phone)}/notes${forInstructor(instructor)}`, {
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
  /** Packed mode: the usual gap between lessons from the old slider (Donna now works it out) */
  bufferMin: number;
  /** Packed mode: the longest drive between two lessons (minutes); null on older settings */
  maxDriveMin?: number | null;
  /** Added to every real drive for traffic and parking (minutes) */
  driveVarianceMin: number;
}

export type DayHours = { start: string; end: string } | null;
export interface Lunch {
  enabled: boolean;
  durationMin: number;
  windowFrom: string;
  windowTo: string;
}

export interface BotSettings {
  /** Master switch: off = Donna stops replying and booking */
  donnaEnabled: boolean;
  /** "fixed": the instructor picks start times; "packed": Donna fits lessons into dayHours */
  scheduleMode: "fixed" | "packed";
  dayHours: Record<DayKey, DayHours>;
  lunch: Lunch;
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
  /** The profile is filled in (enough to request a WhatsApp number) */
  complete: boolean;
  required: Array<{ key: string; label: string; done: boolean; link: string }>;
  missing: string[];
  hasNumber: boolean;
  calendarConnected: boolean;
  /** Google access expired: Donna is paused until it's reconnected */
  calendarExpired: boolean;
  /** Donna can be switched on: profile, number and a working calendar */
  ready: boolean;
  /** What's still in the way of turning Donna on, in the order to do it */
  blockers: Array<{ key: string; label: string; link: string }>;
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
  /** Switched on, but paused because Google Calendar access expired */
  donnaPausedForCalendar?: boolean;
  baseAddress: string;
  hasBaseLocation: boolean;
  routeSettings: RouteSettings;
  botSettings: BotSettings;
  presets: Record<string, { enabled?: boolean; maxAddedDriveMin?: number; travelGraceMin?: number; fragmentationPenalty?: string }>;
  /** Packed mode: the longest drive (set) and the usual gap Donna works out */
  packing?: Packing;
}

export interface Packing {
  maxDriveMin: number;
  /** The usual gap between lessons Donna packs with (minutes) */
  bufferMin: number;
  /** learned: from recent drives; previous: the old slider; default: half the longest drive */
  bufferSource: "learned" | "previous" | "default";
  bufferSamples: number;
  /** Drives Donna needs to see before she learns the usual gap */
  learnAfter: number;
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

export interface DayPreview {
  /** The usual gap Donna packs with for these settings */
  bufferMin: number;
  maxDriveMin: number;
  bufferSource: Packing["bufferSource"];
  dayHours: { start: string; end: string };
  lunch: Lunch;
  days: Array<{
    durationMin: number;
    name: string | null;
    count: number;
    starts: string[];
    lunch: { from: string; to: string } | null;
  }>;
}

/** How many lessons of each length fit a day with these (draft) settings, if every drive takes the usual gap. */
export async function previewDay(
  token: string,
  body: { maxDriveMin?: number; dayHours?: { start: string; end: string }; lunch?: Partial<Lunch> },
  instructor?: string
) {
  const res = await fetch(`${API_BASE}/api/dashboard/day-preview${forInstructor(instructor)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to preview your day");
  return data.data as DayPreview;
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

export async function getLessonTypes(token: string, instructor?: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types${forInstructor(instructor)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch lesson types");
  return data.data as LessonType[];
}

export interface LessonType {
  _id: string;
  name: string;
  price: number;
  /** Lesson length in minutes; null on older types until the instructor sets one */
  durationMin: number | null;
  description: string;
  active: boolean;
  sortOrder: number;
}

/** "1h", "1h 30m", "45 min" */
export function formatDuration(min: number | null | undefined) {
  if (!min) return "";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export async function createLessonType(
  token: string,
  body: { name: string; price: number; durationMin: number; description?: string },
  instructor?: string
) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types${forInstructor(instructor)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create lesson type");
  return data.data;
}

export async function updateLessonType(token: string, id: string, body: Record<string, unknown>, instructor?: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types/${id}${forInstructor(instructor)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update lesson type");
  return data.data;
}

export async function deleteLessonType(token: string, id: string, instructor?: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/lesson-types/${id}${forInstructor(instructor)}`, {
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
  /** Google access expired: Donna is paused for them until they reconnect */
  calendarExpired?: boolean;
  donnaEnabled: boolean;
  setup: SetupStatus;
  learners: number;
  lessonsThisWeek: number;
  upcomingLessons: number;
  joinedAt: string | null;
}

export interface SchoolOverview {
  school: { id: string; name: string; seatLimit: number; includedSeats: number; extraSeats: number; planAmount: number; extraSeatAmount: number; canBuySeats: boolean; seatsUnavailable?: "no_subscription" | "not_set_up" | null; trialEndsAt?: string | null; seatsCheckout?: "seats_only" | "plan_and_seats" | null };
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
export type LearnerSummary = Awaited<ReturnType<typeof getLearners>>[number];
export type SchoolLearner = LearnerSummary & { instructor: { id: string; name: string } };
// Every learner across the school's instructors (owner or manager)
export const getSchoolLearners = (token: string) => schoolRequest<SchoolLearner[]>(token, "/learners");

// ─── School analytics (owner and managers) ─────────────────────────────────

type Learnerref = { phone: string; name: string; instructor: { id: string; name: string } };
export interface SchoolAnalytics {
  period: { from: string; to: string; prevFrom: string; prevTo: string };
  allInstructors: Array<{ id: string; name: string }>;
  cards: {
    lessons: { value: number; completed: number; change: number | null };
    hours: { value: number; change: number | null };
    revenue: { booked: number; collected: number; unpaid: number; change: number | null };
    learners: { active: number; new: number; change: number | null };
    cancellations: { rate: number; count: number; late: number; change: number | null };
    diaryFilled: { value: number; change: number | null };
    donna: { conversations: number; conversationsChange: number | null; bookedShare: number | null; untracked: number };
  };
  instructors: Array<{
    id: string;
    name: string;
    role: "member" | "manager";
    lessons: number;
    lessonsChange: number | null;
    hours: number;
    bookedValue: number;
    unpaid: number;
    diaryFilled: number;
    cancelRate: number;
    activeLearners: number;
    newLearners: number;
    avgDrive: number | null;
    avgRating: number | null;
    conversations: number;
    donna: "on" | "off" | "paused";
  }>;
  charts: {
    buckets: string[];
    lessons: Array<{ id: string; name: string; values: number[] }>;
    revenue: Array<{ booked: number; collected: number }>;
    learners: Array<{ new: number; returning: number }>;
    heatmap: { days: string[]; hours: number[]; counts: number[][] };
  };
  atRisk: Array<Learnerref & { lastLesson: string; lessons: number }>;
  unpaidLessons: Array<Learnerref & { bookingId: string; date: string; time: string; amount: number }>;
  topLearners: Array<Learnerref & { hours: number }>;
}

const analyticsQuery = (q: { from: string; to: string; instructors?: string[] }) =>
  `from=${q.from}&to=${q.to}${q.instructors?.length ? `&instructors=${q.instructors.join(",")}` : ""}`;

export const getSchoolAnalytics = (token: string, q: { from: string; to: string; instructors?: string[] }) =>
  schoolRequest<SchoolAnalytics>(token, `/analytics?${analyticsQuery(q)}`);

/** Downloads one section as a CSV file. */
export async function downloadSchoolAnalyticsCsv(
  token: string,
  section: "instructors" | "at-risk" | "unpaid",
  q: { from: string; to: string; instructors?: string[] }
) {
  const res = await fetch(`${API_BASE}/api/school/analytics.csv?section=${section}&${analyticsQuery(q)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Couldn't download that");
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement("a"), { href: url, download: `${section}-${q.from}-to-${q.to}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

// Owner without a subscription: pay for seats through Stripe Checkout
export const startSeatsCheckout = (token: string, extraSeats: number) =>
  schoolRequest<{ url: string }>(token, "/seats/checkout", { method: "POST", body: JSON.stringify({ extraSeats }) });
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

export interface Referral {
  code: string;
  url: string;
  signedUp: number;
  rewarded: number;
  freeMonths: number;
  maxFreeMonths: number;
}

/** Their "give a month, get a month" link and how it's going. */
export async function getReferral(token: string): Promise<Referral> {
  const res = await fetch(`${API_BASE}/api/dashboard/referral`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Couldn't load your referral link");
  return data.data;
}

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://portal.donnadrive.co.uk";

/**
 * Open the Portal already signed in. Sends a one-time code (2 minutes, single
 * use), never the sign-in token or API key, which would sit in browser history
 * and logs if put in a URL. Without a session it just opens the Portal.
 */
export async function openPortal(e?: { preventDefault: () => void }) {
  e?.preventDefault();
  const token = localStorage.getItem("dd_token");
  let url = PORTAL_URL;
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/handoff`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.code) url = `${PORTAL_URL}?auth_code=${encodeURIComponent(data.code)}`;
    } catch {
      /* open it signed out */
    }
  }
  window.location.href = url;
}
