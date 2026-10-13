import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
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
import {
  exchangeAuthCode,
  getProfile,
  getDashboard,
  requestPhoneNumber,
  getCalendarConnectUrl,
  disconnectCalendar,
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
}

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const authCode = searchParams.get("auth_code");
        const calendarParam = searchParams.get("calendar");
        let currentToken: string | null = null;
        let currentApiKey: string | null = null;

        if (authCode) {
          const result = await exchangeAuthCode(authCode);
          currentToken = result.token;
          currentApiKey = result.apiKey;
          localStorage.setItem("dd_token", result.token);
          if (result.apiKey) localStorage.setItem("dd_apiKey", result.apiKey);
          window.history.replaceState({}, "", "/get-onboard");
        } else {
          currentToken = localStorage.getItem("dd_token");
          currentApiKey = localStorage.getItem("dd_apiKey");
        }

        if (!currentToken) {
          if (!cancelled) {
            setError("Please sign up first to access this page.");
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setToken(currentToken);
          setApiKey(currentApiKey);
        }

        const [profileData, dashboardData] = await Promise.all([
          getProfile(currentToken),
          getDashboard(currentToken, range).catch(() => null),
        ]);

        if (!cancelled) {
          setProfile(profileData);
          setDashboard(dashboardData);

          // Handle OAuth callback result
          if (calendarParam === "connected") {
            setCalendarMsg({ type: "success", text: "Google Calendar connected successfully!" });
            window.history.replaceState({}, "", "/get-onboard");
          } else if (calendarParam === "error") {
            const reason = searchParams.get("reason");
            const text = reason === "not_found"
              ? "Could not find your account. Please try again."
              : "Failed to connect Google Calendar. Please try again.";
            setCalendarMsg({ type: "error", text });
            window.history.replaceState({}, "", "/get-onboard");
          }
        }
      } catch (err) {
        console.error("Dashboard init error:", err);
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

  async function handleRequestNumber() {
    if (!token) return;
    setRequestingNumber(true);
    setNumberError("");
    try {
      const result = await requestPhoneNumber(token);
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
      setNumberError(
        err instanceof Error ? err.message : "Failed to request number"
      );
    } finally {
      setRequestingNumber(false);
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
      subtitle={`${PLAN_LABELS[profile.plan] || profile.plan} plan${profile.subscriptionStatus === "trialing" ? " — 30-day free trial" : ""}`}
      initials={initials}
    >
      <DashboardTour />

      {/* Phone number setup banner */}
      {!hasPhone && (
        <Card data-tour="phone-setup" className="mb-4 border-sky-200 bg-sky-50/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-semibold">Set up your WhatsApp number</p>
                  <p className="text-sm text-muted-foreground">
                    Get a dedicated number so your learners can message Donna AI
                  </p>
                </div>
              </div>
              {numberError && (
                <p className="text-sm text-red-600">{numberError}</p>
              )}
              <Button
                onClick={handleRequestNumber}
                disabled={requestingNumber}
                className="rounded-xl shrink-0"
              >
                {requestingNumber ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Request Number
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasPhone && (
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

      {/* Google Calendar banner */}
      {calendarConnected && calendarTokenExpired && (
        <Card className="mb-4 border-amber-300 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-amber-800">Google Calendar connection expired</p>
                  <p className="text-sm text-amber-700">
                    Donna AI can't create calendar events until you reconnect.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectCalendar}
                disabled={calendarConnecting}
                className="rounded-xl shrink-0 bg-amber-600 hover:bg-amber-700"
              >
                {calendarConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reconnect Calendar
                  </>
                )}
              </Button>
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

      {!calendarConnected && (
        <Card data-tour="calendar-setup" className="mb-6 border-sky-200 bg-sky-50/50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-semibold">Connect Google Calendar</p>
                  <p className="text-sm text-muted-foreground">
                    Donna AI will automatically add lessons to your calendar
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConnectCalendar}
                disabled={calendarConnecting}
                className="rounded-xl shrink-0"
              >
                {calendarConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecting...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Connect Calendar
                  </>
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
