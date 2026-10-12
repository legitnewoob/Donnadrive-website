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
    isNew: boolean;
  };
}

export async function createCheckoutSession(token: string, plan: string) {
  const res = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create checkout session");
  return data as { success: boolean; url: string };
}

export async function exchangeAuthCode(code: string) {
  const res = await fetch(`${API_BASE}/api/auth/exchange-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
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
  return data.instructor as {
    name: string;
    email: string;
    plan: string;
    subscriptionStatus: string | null;
    phoneNumber: string | null;
    phoneNumberId: string | null;
    onboardingComplete: boolean;
    onboardingStatus: { phoneAssigned: boolean; subscriptionActive: boolean; calendarConnected: boolean };
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

export async function getLearners(token: string, search?: string) {
  const q = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/api/dashboard/learners${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch learners");
  return data.data as Array<{
    phone: string; name: string | null; age: number | null; postalCode: string | null;
    instructorNotes: string; createdAt: string | null;
    lessonsCompleted: number; nextLesson: { date: string; time: string } | null;
    totalPaid: number; totalCharged: number; outstanding: number;
    paymentStatus: "paid" | "owes"; progressLevel: "new" | "active" | "test-ready";
  }>;
}

export async function getLearnerDetail(token: string, phone: string) {
  const res = await fetch(`${API_BASE}/api/dashboard/learners/${encodeURIComponent(phone)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch learner");
  return data.data as {
    phone: string; name: string | null; age: number | null; dob: string | null;
    postalCode: string | null; instructorNotes: string; createdAt: string | null;
    lessonsCompleted: number; totalPaid: number; totalCharged: number; outstanding: number;
    lessons: Array<{
      bookingId: string; date: string; time: string; status: string;
      topicsCovered: string[]; rating: number | null; progressNotes: string;
      paymentReceived: boolean; paymentAmount: number;
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
