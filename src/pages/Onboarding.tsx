import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLaunchActions } from "@/components/launch/LaunchProvider";
import mascot from "@/assets/mascot-smile.png";
import { homePath, getSchoolInfo, type SchoolInfo } from "@/lib/access";
import {
  CheckCircle2,
  Phone,
  Loader2,
  AlertCircle,
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  BarChart3,
  Activity,
  Target,
  RefreshCw,
  XCircle,
  Power,
  ChevronRight,
  Circle,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardTour from "@/components/DashboardTour";
import SchoolCard from "@/components/SchoolCard";
import {
  exchangeAuthCode,
  getProfile,
  getDashboard,
  requestPhoneNumber,
  getCalendarConnectUrl,
  disconnectCalendar,
  getSettings,
  updateSettings,
  notifySetupChanged,
  getSchool,
  type SetupStatus,
  type SchoolOverview,
} from "@/lib/api";

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  BarChart3,
  Route: TrendingUp,
  Activity,
};

const PLAN_LABELS: Record<string, string> = {
  pdi: "PDI (Free)",
  adi: "ADI Pro",
  "driving-school": "Driving School",
};

interface Profile {
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string | null;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  onboardingComplete: boolean;
  onboardingStatus: {
    phoneAssigned: boolean;
    subscriptionActive: boolean;
    calendarConnected: boolean;
    calendarTokenExpired?: boolean;
  };
  school?: SchoolInfo | null;
}

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

/**
 * An instructor's dashboard. `variant="school"` is the same dashboard for
 * instructors who teach for a driving school (at /school-dashboard), with their
 * school shown up front; everyone else uses /dashboard.
 */
export default function Onboarding({ variant }: { variant?: "school" } = {}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedOut, setSignedOut] = useState(false);
  const { openSignIn } = useLaunchActions();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [requestingNumber, setRequestingNumber] = useState(false);
  const [numberError, setNumberError] = useState("");
  const [range, setRange] = useState("This week");
  const [calendarConnecting, setCalendarConnecting] = useState(false);
  const [calendarDisconnecting, setCalendarDisconnecting] = useState(false);
  const [calendarMsg, setCalendarMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [donnaEnabled, setDonnaEnabled] = useState(true);
  const [offBySchool, setOffBySchool] = useState(false);
  // Switched on, but paused because Google Calendar access expired
  const [pausedForCalendar, setPausedForCalendar] = useState(false);
  const [savingSwitch, setSavingSwitch] = useState(false);
  const [missingOpen, setMissingOpen] = useState(false);
  // What they were trying to do when we asked them to finish setting up
  const [missingFor, setMissingFor] = useState<"number" | "donna">("number");
  const [school, setSchool] = useState<SchoolOverview | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const authCode = searchParams.get("auth_code");
        const calendarParam = searchParams.get("calendar");
        let currentToken: string | null = null;
        let currentApiKey: string | null = null;

        // From checkout, or from the Portal's dashboard button (a one-time code).
        // A used or expired code falls back to however they're signed in here.
        const exchanged = authCode
          ? await exchangeAuthCode(authCode, searchParams.get("session_id")).catch(() => null)
          : null;
        if (authCode) window.history.replaceState({}, "", "/dashboard");
        if (exchanged) {
          localStorage.setItem("dd_token", exchanged.token);
          if (exchanged.apiKey) localStorage.setItem("dd_apiKey", exchanged.apiKey);
          window.dispatchEvent(new Event("dd_auth_change"));
          // Sent from the Portal to a particular page (only ever a path on this site)
          const next = searchParams.get("next");
          if (next && /^\/[a-z-]/.test(next)) {
            navigate(next, { replace: true });
            return;
          }
        }
        currentToken = localStorage.getItem("dd_token");
        currentApiKey = localStorage.getItem("dd_apiKey");

        if (!currentToken) {
          if (!cancelled) {
            setSignedOut(true);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setToken(currentToken);
          setApiKey(currentApiKey);
        }

        const [profileData, dashboardData, settingsData] = await Promise.all([
          getProfile(currentToken),
          getDashboard(currentToken, range).catch(() => null),
          getSettings(currentToken).catch(() => null),
        ]);

        // Each kind of account has its own home: owners don't run Donna themselves,
        // and instructors in a school get the school version of this page
        const role = profileData.school?.role;
        const home = role === "owner" ? "/school" : role ? "/school-dashboard" : "/dashboard";
        if (home !== (variant === "school" ? "/school-dashboard" : "/dashboard")) {
          navigate(home, { replace: true });
          return;
        }

        if (!cancelled) {
          setProfile(profileData);
          setDashboard(dashboardData);
          if (profileData.school?.role === "manager") {
            getSchool(currentToken).then((sc) => !cancelled && setSchool(sc)).catch(() => {});
          }
          if (settingsData) {
            setSetup(settingsData.setup ?? null);
            setDonnaEnabled(settingsData.botSettings.donnaEnabled !== false);
            setOffBySchool(!!settingsData.donnaOffBySchool);
            setPausedForCalendar(!!settingsData.donnaPausedForCalendar);
          }

          // Handle OAuth callback result
          if (calendarParam === "connected") {
            setCalendarMsg({ type: "success", text: "Google Calendar connected successfully!" });
            window.history.replaceState({}, "", "/dashboard");
          } else if (calendarParam === "error") {
            const reason = searchParams.get("reason");
            const text = reason === "not_found"
              ? "Could not find your account. Please try again."
              : "Failed to connect Google Calendar. Please try again.";
            setCalendarMsg({ type: "error", text });
            window.history.replaceState({}, "", "/dashboard");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load your account."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [searchParams, range]);

  // Signed in from the sign-in screen: load the dashboard they came for
  useEffect(() => {
    if (!signedOut) return;
    const onAuth = () => {
      if (localStorage.getItem("dd_token")) window.location.assign(homePath());
    };
    window.addEventListener("dd_auth_change", onAuth);
    return () => window.removeEventListener("dd_auth_change", onAuth);
  }, [signedOut]);

  async function refreshSetup() {
    if (!token) return null;
    const s = await getSettings(token).catch(() => null);
    if (s?.setup) setSetup(s.setup);
    return s?.setup ?? null;
  }

  async function handleRequestNumber() {
    if (!token) return;
    // Donna needs the basics before she can take bookings on a real number
    if (setup && !setup.complete) {
      setMissingFor("number");
      setMissingOpen(true);
      return;
    }
    setRequestingNumber(true);
    setNumberError("");
    try {
      const result = await requestPhoneNumber(token);
      setSetup((prev) => (prev ? { ...prev, hasNumber: true } : prev));
      refreshSetup();
      notifySetupChanged();
      toast.success(`Your WhatsApp number is ${result.phoneNumber}. Next, connect Google Calendar.`);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              phoneNumber: result.phoneNumber,
              phoneNumberId: result.phoneNumberId,
              onboardingStatus: {
                ...prev.onboardingStatus,
                phoneAssigned: true,
              },
            }
          : prev
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to request number";
      if (/finish setting up donna/i.test(message)) {
        await refreshSetup();
        setMissingOpen(true);
      } else {
        setNumberError(message);
      }
    } finally {
      setRequestingNumber(false);
    }
  }

  // What to show in the "finish setting up" dialog
  const missingItems =
    missingFor === "donna"
      ? setup?.blockers ?? []
      : (setup?.required ?? []).filter((r) => !r.done).map(({ key, label, link }) => ({ key, label, link }));

  // Number and calendar steps live on this page; the rest are on other pages
  function goToStep(step: { key: string; link: string }) {
    if (step.key === "calendar" || step.key === "calendarExpired") return void handleConnectCalendar();
    if (step.key === "number") {
      document.getElementById("setup-steps")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    navigate(step.link);
  }

  async function handleToggleDonna(next: boolean) {
    if (!token) return;
    // Donna can't do her job until the profile, her WhatsApp number and a
    // working Google Calendar are all done
    if (next && setup && !setup.ready) {
      setMissingFor("donna");
      setMissingOpen(true);
      return;
    }
    setDonnaEnabled(next);
    setSavingSwitch(true);
    try {
      await updateSettings(token, { botSettings: { donnaEnabled: next } });
      toast.success(next ? "Donna is back on and replying to learners." : "Donna is off. Learners will be asked to contact you directly.");
    } catch (err) {
      setDonnaEnabled(!next);
      // Setup changed elsewhere since this page loaded
      const latest = next ? await refreshSetup() : null;
      if (latest && !latest.ready) {
        setMissingFor("donna");
        setMissingOpen(true);
        return;
      }
      toast.error(err instanceof Error ? err.message : "Couldn't change Donna's status");
    } finally {
      setSavingSwitch(false);
    }
  }

  async function handleConnectCalendar() {
    if (!token) return;
    setCalendarConnecting(true);
    setCalendarMsg(null);
    try {
      const { url } = await getCalendarConnectUrl(token);
      window.location.href = url;
    } catch (err) {
      setCalendarMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to start calendar connection",
      });
      setCalendarConnecting(false);
    }
  }

  async function handleDisconnectCalendar() {
    if (!token) return;
    setCalendarDisconnecting(true);
    setCalendarMsg(null);
    try {
      await disconnectCalendar(token);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              onboardingStatus: {
                ...prev.onboardingStatus,
                calendarConnected: false,
                calendarTokenExpired: false,
              },
            }
          : prev
      );
      setCalendarMsg({ type: "success", text: "Google Calendar disconnected." });
    } catch (err) {
      setCalendarMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to disconnect calendar",
      });
    } finally {
      setCalendarDisconnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (signedOut) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border bg-white p-6 text-center shadow-sm sm:p-8">
          <img src={mascot} alt="" className="mx-auto mb-4 h-24 w-auto" />
          <h1 className="mb-2 text-2xl font-bold">Sign in to see your dashboard</h1>
          <p className="mb-6 text-muted-foreground">
            Your dashboard lives on the Donna Drive website. Sign in with the same Google account you use for the Portal.
          </p>
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full" onClick={openSignIn}>
              Sign in with Google
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/")}>
              Back to home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  // Known from sign-in (so it shows straight away), refreshed by the profile
  const schoolInfo = variant === "school" ? profile.school ?? getSchoolInfo() : null;

  const hasPhone = !!profile.phoneNumber;
  const calendarConnected = profile.onboardingStatus.calendarConnected;
  const calendarTokenExpired = profile.onboardingStatus.calendarTokenExpired;
  const firstName = profile.name.split(" ")[0];
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const revenuePercent = dashboard
    ? Math.round(
        (dashboard.revenueGoal.current / dashboard.revenueGoal.target) * 100
      )
    : 0;

  return (
    <DashboardLayout
      title={`Welcome, ${firstName}!`}
      subtitle={
        schoolInfo
          ? `${schoolInfo.role === "manager" ? "Manager" : "Instructor"} at ${schoolInfo.name || "your driving school"}`
          : `${PLAN_LABELS[profile.plan] || profile.plan} plan${profile.subscriptionStatus === "trialing" ? " — 30-day free trial" : ""}`
      }
      initials={initials}
    >
      <DashboardTour />

      {/* Teaching for a driving school: whose account this is */}
      {schoolInfo && <SchoolCard school={schoolInfo} onManageTeam={schoolInfo.role === "manager" ? () => navigate("/team") : undefined} />}

      {/* Driving school owner: team at a glance */}
      {school && !schoolInfo && (
        <Card className="mb-4 border-sky-200">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100">
              <Users className="h-5 w-5 text-sky-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{school.school.name}</p>
              <p className="text-sm text-muted-foreground">
                {school.seats.members} instructor{school.seats.members === 1 ? "" : "s"}
                {school.seats.invites ? ` · ${school.seats.invites} invited` : ""} · {school.seats.used} of {school.seats.limit} seats used
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/team")}>Manage team</Button>
          </CardContent>
        </Card>
      )}

      {/* Donna on/off */}
      <DonnaSwitchCard
        enabled={donnaEnabled}
        saving={savingSwitch}
        blockers={setup?.blockers ?? []}
        pausedForCalendar={pausedForCalendar}
        offBySchool={offBySchool}
        onChange={handleToggleDonna}
      />

      {/* Getting started: settings → number → calendar */}
      {(!hasPhone || !calendarConnected) && (
        <SetupCard
          setup={setup}
          hasPhone={hasPhone}
          phoneNumber={profile.phoneNumber}
          calendarConnected={calendarConnected}
          requestingNumber={requestingNumber}
          numberError={numberError}
          calendarConnecting={calendarConnecting}
          onRequestNumber={handleRequestNumber}
          onConnectCalendar={handleConnectCalendar}
          onGo={(link) => navigate(link)}
        />
      )}

      {hasPhone && calendarConnected && (
        <Card data-tour="phone-setup" className="mb-4 border-green-200 bg-green-50/50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <p className="text-sm">
                <span className="font-semibold">WhatsApp number active:</span>{" "}
                {profile.phoneNumber}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={missingOpen} onOpenChange={setMissingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finish setting up Donna first</DialogTitle>
            <DialogDescription>
              {missingFor === "donna"
                ? "Donna can go on once these are done, so she never tells learners something she can't back up:"
                : "Donna needs these before she can take bookings on your WhatsApp number:"}
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {missingItems.map((r) => (
              <li key={r.key}>
                <button
                  onClick={() => { setMissingOpen(false); goToStep(r); }}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span className="flex-1">{r.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMissingOpen(false)}>Later</Button>
            <Button onClick={() => { setMissingOpen(false); if (missingItems[0]) goToStep(missingItems[0]); }}>
              {missingFor === "donna" ? "Do the first one" : "Fill them in"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Calendar message (success/error from OAuth callback) */}
      {calendarMsg && (
        <Card className={`mb-4 ${calendarMsg.type === "success" ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {calendarMsg.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <p className="text-sm">{calendarMsg.text}</p>
              </div>
              <button
                onClick={() => setCalendarMsg(null)}
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {calendarConnected && !calendarTokenExpired && (
        <Card className="mb-4 border-green-200 bg-green-50/50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold">Google Calendar connected</span>
                  <span className="hidden sm:inline"> — lessons are synced automatically.</span>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnectCalendar}
                disabled={calendarDisconnecting}
                className="text-muted-foreground hover:text-red-600 shrink-0"
              >
                {calendarDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Disconnect"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {dashboard && (
        // On phones, today's schedule and activity come before the charts.
        <div className="flex flex-col">
          {/* Date range selector */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="flex gap-1">
              {["This week", "This month", "This year"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    range === r
                      ? "bg-sky-600 text-white"
                      : "bg-white text-muted-foreground hover:bg-slate-100 border"
                  }`}
                >
                  {r.replace("This ", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div data-tour="stats" className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {dashboard.stats.map((stat) => {
              const Icon = ICON_MAP[stat.icon] || Activity;
              const isPositive = stat.change.startsWith("+");
              return (
                <Card key={stat.title}>
                  <CardContent className="pt-5 pb-4 px-5">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center ${stat.bgColor}`}
                      >
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isPositive ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stat.title}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts row */}
          <div data-tour="charts" className="order-last lg:order-none grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {/* Revenue Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-600" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dashboard.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={40} />
                    <Tooltip
                      formatter={(value: number) => [`£${value}`, "Revenue"]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#0ea5e9"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Lesson Status Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Lesson Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={dashboard.lessonData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {dashboard.lessonData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Student Growth Line Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-sky-600" />
                  Student Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dashboard.studentGrowth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} width={30} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="students"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#0ea5e9" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Goal + Schedule row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Revenue Goal */}
            <Card data-tour="revenue-goal">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-sky-600" />
                  Monthly Revenue Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-bold">
                      £{dashboard.revenueGoal.current.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      / £{dashboard.revenueGoal.target.toLocaleString()}
                    </p>
                  </div>
                  <Progress value={Math.min(revenuePercent, 100)} className="h-3" />
                  <p className="text-xs text-muted-foreground">
                    {revenuePercent}% of monthly target
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card data-tour="schedule" className="order-first lg:order-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {dashboard.todaySchedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No lessons scheduled for today
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.todaySchedule.map((lesson, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                            {lesson.student
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {lesson.student}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.time} · {lesson.duration}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            lesson.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }
                        >
                          {lesson.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity + Upcoming row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-sky-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {dashboard.activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No recent activity
                  </p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.activity.map((item, i) => {
                      const Icon = ICON_MAP[item.icon] || Activity;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="h-4 w-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm">{item.text}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Lessons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-600" />
                  Upcoming Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {dashboard.upcomingLessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No upcoming lessons
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dashboard.upcomingLessons.map((lesson, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                            {lesson.student
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {lesson.student}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ── Donna on/off ─────────────────────────────────────────────────────────────

function DonnaSwitchCard({
  enabled,
  saving,
  blockers,
  pausedForCalendar,
  offBySchool,
  onChange,
}: {
  enabled: boolean;
  saving: boolean;
  /** What's still needed before she can go on (profile, number, calendar) */
  blockers: Array<{ key: string; label: string }>;
  pausedForCalendar: boolean;
  offBySchool: boolean;
  onChange: (next: boolean) => void;
}) {
  const ready = blockers.length === 0;
  // Paused for the calendar is urgent; not set up yet isn't an emergency switch-off
  const tone = pausedForCalendar ? "amber" : enabled ? "green" : ready ? "red" : "slate";
  const toDo = blockers.map((b) => b.label.charAt(0).toLowerCase() + b.label.slice(1)).join(", ");
  return (
    <Card className={`mb-4 ${{ green: "border-green-200 bg-green-50/40", red: "border-red-300 bg-red-50/60", amber: "border-amber-300 bg-amber-50/60", slate: "border-slate-200 bg-white" }[tone]}`}>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${{ green: "bg-green-100", red: "bg-red-100", amber: "bg-amber-100", slate: "bg-slate-100" }[tone]}`}>
            <Power className={`h-5 w-5 ${{ green: "text-green-600", red: "text-red-600", amber: "text-amber-600", slate: "text-slate-500" }[tone]}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{pausedForCalendar ? "Donna is paused" : enabled ? "Donna is on" : "Donna is off"}</p>
            <p className="text-sm text-muted-foreground">
              {pausedForCalendar
                ? "Your Google Calendar connection expired, so she can't see your diary. Reconnect it and she starts again by herself."
                : enabled
                  ? "She's replying to learners and booking lessons."
                  : offBySchool
                    ? "Your driving school has switched Donna off for everyone. Ask them to turn her back on."
                    : ready
                      ? "Learners are told to contact you directly, and their messages come to you."
                      : `She can go on once you've done these: ${toDo}.`}
            </p>
          </div>
          <Switch
            checked={enabled}
            disabled={saving || offBySchool || pausedForCalendar}
            onCheckedChange={onChange}
            aria-label={enabled ? "Turn Donna off" : "Turn Donna on"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Getting started: settings → number → calendar ───────────────────────────

function StepIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) return <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />;
  return <Circle className={`h-5 w-5 shrink-0 ${active ? "text-sky-600" : "text-slate-300"}`} />;
}

function SetupCard({
  setup,
  hasPhone,
  phoneNumber,
  calendarConnected,
  requestingNumber,
  numberError,
  calendarConnecting,
  onRequestNumber,
  onConnectCalendar,
  onGo,
}: {
  setup: SetupStatus | null;
  hasPhone: boolean;
  phoneNumber: string | null;
  calendarConnected: boolean;
  requestingNumber: boolean;
  numberError: string;
  calendarConnecting: boolean;
  onRequestNumber: () => void;
  onConnectCalendar: () => void;
  onGo: (link: string) => void;
}) {
  const settingsDone = hasPhone || !!setup?.complete;

  return (
    <Card id="setup-steps" className="mb-6 border-sky-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Get Donna ready</CardTitle>
        <p className="text-sm text-muted-foreground">Three quick steps before learners can book with you on WhatsApp.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Step 1: required settings */}
        <div className="flex gap-3">
          <StepIcon done={settingsDone} active={!settingsDone} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">1. Fill in your Donna Settings</p>
            {!settingsDone && setup && (
              <ul className="mt-2 space-y-1.5">
                {setup.required.map((r) => (
                  <li key={r.key} className="flex items-center gap-2 text-sm">
                    {r.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                    ) : (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
                    )}
                    <span className={`flex-1 ${r.done ? "text-muted-foreground" : ""}`}>{r.label}</span>
                    {!r.done && (
                      <button onClick={() => onGo(r.link)} className="shrink-0 text-sm font-medium text-sky-700 hover:underline">
                        Add
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {settingsDone && <p className="text-sm text-muted-foreground">Done. You can change these any time.</p>}
          </div>
        </div>

        {/* Step 2: WhatsApp number */}
        <div className="flex gap-3" data-tour="phone-setup">
          <StepIcon done={hasPhone} active={settingsDone && !hasPhone} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">2. Get your WhatsApp number</p>
            {hasPhone ? (
              <p className="text-sm text-muted-foreground">Learners message Donna on {phoneNumber}.</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {settingsDone
                    ? "Your learners will message Donna on this number."
                    : "Fill in the settings above first, then request your number."}
                </p>
                {numberError && <p className="mt-1 text-sm text-red-600">{numberError}</p>}
                <Button
                  onClick={onRequestNumber}
                  disabled={requestingNumber}
                  variant={settingsDone ? "default" : "outline"}
                  size="sm"
                  className="mt-2 rounded-xl"
                >
                  {requestingNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
                  Request number
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Step 3: Google Calendar */}
        <div className="flex gap-3" data-tour="calendar-setup">
          <StepIcon done={calendarConnected} active={hasPhone && !calendarConnected} />
          <div className="min-w-0 flex-1">
            <p className="font-medium">3. Connect Google Calendar</p>
            <p className="text-sm text-muted-foreground">
              {calendarConnected
                ? "Lessons are synced automatically."
                : hasPhone
                  ? "Donna adds lessons to your calendar and checks it before offering times."
                  : "Request your WhatsApp number first."}
            </p>
            {!calendarConnected && (
              <Button
                onClick={onConnectCalendar}
                disabled={!hasPhone || calendarConnecting}
                size="sm"
                className="mt-2 rounded-xl"
              >
                {calendarConnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                Connect Calendar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
