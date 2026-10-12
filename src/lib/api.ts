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
