import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CalendarClock,
  Clock,
  Download,
  GraduationCap,
  Loader2,
  MessageCircle,
  PoundSterling,
  XCircle,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getSchoolAnalytics, downloadSchoolAnalyticsCsv, type SchoolAnalytics as Data } from "@/lib/api";

// ── Periods ──────────────────────────────────────────────────────────────────

type PeriodKey = "this-week" | "last-week" | "this-month" | "last-month" | "last-3-months" | "custom";
const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: "this-week", label: "This week" },
  { key: "last-week", label: "Last week" },
  { key: "this-month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "last-3-months", label: "Last 3 months" },
  { key: "custom", label: "Custom" },
];
const ymd = (d: Date) => format(d, "yyyy-MM-dd");

function rangeFor(key: PeriodKey, custom: { from: string; to: string }) {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  switch (key) {
    case "this-week":
      return { from: ymd(monday), to: ymd(addDays(monday, 6)) };
    case "last-week":
      return { from: ymd(addDays(monday, -7)), to: ymd(addDays(monday, -1)) };
    case "this-month":
      return { from: ymd(startOfMonth(today)), to: ymd(endOfMonth(today)) };
    case "last-month": {
      const last = subMonths(today, 1);
      return { from: ymd(startOfMonth(last)), to: ymd(endOfMonth(last)) };
    }
    case "last-3-months":
      return { from: ymd(startOfMonth(subMonths(today, 2))), to: ymd(endOfMonth(today)) };
    default:
      return custom;
  }
}

// Filters are remembered per browser (a convenience; it works without storage too)
const STORE = "dd_school_analytics";
function loadFilters(): { period: PeriodKey; custom: { from: string; to: string }; instructors: string[] } {
  const fallback = {
    period: "this-month" as PeriodKey,
    custom: { from: ymd(startOfMonth(new Date())), to: ymd(new Date()) },
    instructors: [] as string[],
  };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORE) || "{}") };
  } catch {
    return fallback;
  }
}

// ── Formatting ───────────────────────────────────────────────────────────────

const pounds = (n: number) => `£${n.toLocaleString("en-GB", { maximumFractionDigits: n % 1 ? 2 : 0 })}`;
const shortDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;
const SERIES = ["#f2584a", "#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#64748b"];

/** "+12%" against the previous period; `goodWhenDown` for cancellations. */
function Change({ value, goodWhenDown = false }: { value: number | null; goodWhenDown?: boolean }) {
  if (value === null) return <span className="text-xs text-slate-400">new</span>;
  if (value === 0) return <span className="text-xs text-slate-400">no change</span>;
  const up = value > 0;
  const good = goodWhenDown ? !up : up;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center text-xs font-medium ${good ? "text-green-700" : "text-red-600"}`}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value)}%
    </span>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  change,
  goodWhenDown,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  change?: number | null;
  goodWhenDown?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Icon className="h-3.5 w-3.5" /> {label}
          </span>
          {change !== undefined && <Change value={change} goodWhenDown={goodWhenDown} />}
        </div>
        <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

const DONNA_BADGE = {
  on: <Badge variant="outline" className="border-green-300 text-green-700">On</Badge>,
  off: <Badge variant="outline" className="border-red-300 text-red-700">Off</Badge>,
  paused: <Badge variant="outline" className="border-amber-300 text-amber-700">Paused</Badge>,
};

type Row = Data["instructors"][number];
type SortKey = keyof Pick<Row, "name" | "lessons" | "hours" | "bookedValue" | "unpaid" | "diaryFilled" | "cancelRate" | "activeLearners" | "newLearners" | "avgDrive" | "avgRating">;
const COLUMNS: Array<{ key: SortKey; label: string; show: (r: Row) => React.ReactNode }> = [
  { key: "lessons", label: "Lessons", show: (r) => r.lessons },
  { key: "hours", label: "Hours", show: (r) => r.hours },
  { key: "bookedValue", label: "Booked", show: (r) => pounds(r.bookedValue) },
  { key: "unpaid", label: "Unpaid", show: (r) => (r.unpaid ? <span className="text-amber-700">{pounds(r.unpaid)}</span> : "—") },
  {
    key: "diaryFilled",
    label: "Diary filled",
    show: (r) => <span className={r.diaryFilled < 50 ? "text-amber-700" : ""}>{r.diaryFilled}%</span>,
  },
  {
    key: "cancelRate",
    label: "Cancelled",
    show: (r) => <span className={r.cancelRate > 15 ? "font-medium text-red-600" : ""}>{r.cancelRate}%</span>,
  },
  { key: "activeLearners", label: "Learners", show: (r) => r.activeLearners },
  { key: "newLearners", label: "New", show: (r) => r.newLearners },
  { key: "avgDrive", label: "Avg drive", show: (r) => (r.avgDrive != null ? `${r.avgDrive} min` : "—") },
  { key: "avgRating", label: "Rating", show: (r) => (r.avgRating != null ? `${r.avgRating} ★` : "—") },
];

/**
 * Analytics for a driving school's owner and managers: how each instructor is
 * doing, how learners are getting on, and what Donna handles.
 */
export default function SchoolAnalytics() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const initial = useMemo(loadFilters, []);
  const [period, setPeriod] = useState<PeriodKey>(initial.period);
  const [custom, setCustom] = useState(initial.custom);
  const [instructors, setInstructors] = useState<string[]>(initial.instructors);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "lessons", desc: true });

  const range = rangeFor(period, custom);
  const query = useMemo(() => ({ ...range, instructors }), [range.from, range.to, instructors]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify({ period, custom, instructors }));
    } catch {
      /* storage unavailable: filters just aren't remembered */
    }
  }, [period, custom, instructors]);

  useEffect(() => {
    if (!token) return navigate("/");
    if (!query.from || !query.to || query.from > query.to) return;
    let stale = false;
    setLoading(true);
    getSchoolAnalytics(token, query)
      .then((d) => {
        if (stale) return;
        setData(d);
        setError("");
      })
      .catch((e) => !stale && setError(e instanceof Error ? e.message : "Couldn't load analytics"))
      .finally(() => !stale && setLoading(false));
    return () => {
      stale = true;
    };
  }, [token, navigate, query]);

  const rows = useMemo(() => {
    if (!data) return [];
    const { key, desc } = sort;
    return [...data.instructors].sort((a, b) => {
      const x = a[key] ?? -1;
      const y = b[key] ?? -1;
      const cmp = typeof x === "string" ? String(x).localeCompare(String(y)) : Number(x) - Number(y);
      return desc ? -cmp : cmp;
    });
  }, [data, sort]);

  function toggleInstructor(id: string) {
    setInstructors((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function exportCsv(section: "instructors" | "at-risk" | "unpaid") {
    try {
      await downloadSchoolAnalyticsCsv(token!, section, query);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't download that");
    }
  }

  const c = data?.cards;
  const lessonsChart = data
    ? data.charts.buckets.map((label, i) => ({ label, ...Object.fromEntries(data.charts.lessons.map((s) => [s.name, s.values[i]])) }))
    : [];
  const revenueChart = data
    ? data.charts.buckets.map((label, i) => ({ label, Booked: data.charts.revenue[i].booked, Collected: data.charts.revenue[i].collected }))
    : [];
  const learnersChart = data
    ? data.charts.buckets.map((label, i) => ({ label, New: data.charts.learners[i].new, Returning: data.charts.learners[i].returning }))
    : [];
  const heatMax = data ? Math.max(1, ...data.charts.heatmap.counts.flat()) : 1;

  return (
    <DashboardLayout title="Analytics" subtitle="How your instructors and learners are doing">
      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <Button key={p.key} size="sm" variant={period === p.key ? "default" : "outline"} onClick={() => setPeriod(p.key)}>
                {p.label}
              </Button>
            ))}
          </div>
          {period === "custom" && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Input type="date" value={custom.from} max={custom.to} onChange={(e) => setCustom((x) => ({ ...x, from: e.target.value }))} className="w-auto" aria-label="From" />
              <span className="text-slate-500">to</span>
              <Input type="date" value={custom.to} min={custom.from} max={ymd(addMonths(new Date(custom.from || new Date()), 12))} onChange={(e) => setCustom((x) => ({ ...x, to: e.target.value }))} className="w-auto" aria-label="To" />
            </div>
          )}
          {data && data.allInstructors.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Instructors">
              <Button size="sm" variant={instructors.length === 0 ? "default" : "outline"} onClick={() => setInstructors([])}>
                Everyone
              </Button>
              {data.allInstructors.map((i) => (
                <Button key={i.id} size="sm" variant={instructors.includes(i.id) ? "default" : "outline"} onClick={() => toggleInstructor(i.id)}>
                  {i.name}
                </Button>
              ))}
            </div>
          )}
          {data && (
            <p className="text-xs text-slate-500">
              {shortDate(data.period.from)} – {shortDate(data.period.to)}, compared with {shortDate(data.period.prevFrom)} – {shortDate(data.period.prevTo)}
            </p>
          )}
        </CardContent>
      </Card>

      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && !data && (
        <div className="flex justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {data && c && (
        <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {/* Headline numbers */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat icon={CalendarClock} label="Lessons" value={String(c.lessons.value)} sub={`${c.lessons.completed} completed`} change={c.lessons.change} />
            <Stat icon={Clock} label="Hours taught" value={String(c.hours.value)} change={c.hours.change} />
            <Stat
              icon={PoundSterling}
              label="Revenue booked"
              value={pounds(c.revenue.booked)}
              sub={`${pounds(c.revenue.collected)} collected${c.revenue.unpaid ? ` · ${pounds(c.revenue.unpaid)} unpaid` : ""}`}
              change={c.revenue.change}
            />
            <Stat icon={GraduationCap} label="Learners" value={String(c.learners.active)} sub={`${c.learners.new} new · ${data.atRisk.length} at risk`} change={c.learners.change} />
            <Stat
              icon={XCircle}
              label="Cancellations"
              value={`${c.cancellations.rate}%`}
              sub={`${c.cancellations.count} cancelled${c.cancellations.late ? ` · ${c.cancellations.late} late` : ""}`}
              change={c.cancellations.change}
              goodWhenDown
            />
            <Stat icon={BarChart3} label="Diary filled" value={`${c.diaryFilled.value}%`} sub="Booked hours of working hours" change={c.diaryFilled.change} />
            <Stat icon={MessageCircle} label="Conversations" value={String(c.donna.conversations)} sub="Learners Donna talked to" change={c.donna.conversationsChange} />
            <Stat
              icon={Bot}
              label="Booked by Donna"
              value={c.donna.bookedShare != null ? `${c.donna.bookedShare}%` : "—"}
              sub={c.donna.untracked ? `${c.donna.untracked} lessons from before tracking` : "Of lessons booked"}
            />
          </div>

          {/* Instructors */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base">Instructors</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => exportCsv("instructors")}>
                <Download className="mr-1.5 h-4 w-4" /> CSV
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {/* Phones: a card per instructor */}
              <div className="divide-y md:hidden">
                {rows.map((r) => (
                  <button key={r.id} onClick={() => navigate(`/team/${r.id}`)} className="w-full p-4 text-left hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{r.name}</span>
                      {DONNA_BADGE[r.donna]}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                      {COLUMNS.slice(0, 6).map((col) => (
                        <div key={col.key}>
                          <div className="text-slate-400">{col.label}</div>
                          <div className="font-medium text-slate-900">{col.show(r)}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
              {/* Wider screens: a sortable table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-slate-50 text-left text-xs text-slate-500">
                      {[{ key: "name" as SortKey, label: "Instructor" }, ...COLUMNS].map((col) => (
                        <th key={col.key} className="whitespace-nowrap px-3 py-2 font-medium">
                          <button
                            onClick={() => setSort((s) => ({ key: col.key, desc: s.key === col.key ? !s.desc : col.key !== "name" }))}
                            className="hover:text-slate-900"
                            aria-sort={sort.key === col.key ? (sort.desc ? "descending" : "ascending") : undefined}
                          >
                            {col.label}
                            {sort.key === col.key ? (sort.desc ? " ↓" : " ↑") : ""}
                          </button>
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium">Donna</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} onClick={() => navigate(`/team/${r.id}`)} className="cursor-pointer border-b last:border-0 hover:bg-slate-50">
                        <td className="whitespace-nowrap px-3 py-2.5 font-medium">{r.name}</td>
                        {COLUMNS.map((col) => (
                          <td key={col.key} className="whitespace-nowrap px-3 py-2.5 tabular-nums">{col.show(r)}</td>
                        ))}
                        <td className="px-3 py-2.5">{DONNA_BADGE[r.donna]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No instructors yet. Invite them from the Team page.</p>}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Lessons">
              <BarChart data={lessonsChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {data.charts.lessons.map((s, i) => (
                  <Bar key={s.id} dataKey={s.name} stackId="lessons" fill={SERIES[i % SERIES.length]} />
                ))}
              </BarChart>
            </ChartCard>
            <ChartCard title="Revenue">
              <BarChart data={revenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} tickFormatter={(v) => `£${v}`} />
                <Tooltip formatter={(v: number) => pounds(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Booked" fill="#f2584a" />
                <Bar dataKey="Collected" fill="#10b981" />
              </BarChart>
            </ChartCard>
            <ChartCard title="Learners">
              <BarChart data={learnersChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Returning" stackId="l" fill="#0ea5e9" />
                <Bar dataKey="New" stackId="l" fill="#8b5cf6" />
              </BarChart>
            </ChartCard>
            <Card className="min-w-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Busiest days and times</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="text-[11px] text-slate-500" aria-label="Lessons by day and hour">
                  <thead>
                    <tr>
                      <th />
                      {data.charts.heatmap.hours.map((h) => (
                        <th key={h} className="px-0.5 font-normal">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.charts.heatmap.days.map((d, di) => (
                      <tr key={d}>
                        <th className="pr-2 text-left font-normal">{d}</th>
                        {data.charts.heatmap.counts[di].map((n, hi) => (
                          <td key={hi} className="p-0.5">
                            <div
                              title={`${d} ${data.charts.heatmap.hours[hi]}:00 · ${n} lesson${n === 1 ? "" : "s"}`}
                              className="h-6 w-6 rounded"
                              style={{ background: n ? `rgba(242, 88, 74, ${0.15 + (0.85 * n) / heatMax})` : "#f1f5f9" }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-xs text-slate-500">Darker means more lessons start at that hour. Pale spots are where there's room to grow.</p>
              </CardContent>
            </Card>
          </div>

          {/* Learner lists */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ListCard
              title={`At risk (${data.atRisk.length})`}
              hint="Had lessons, but nothing for 3 weeks and nothing booked. Worth a message."
              onCsv={() => exportCsv("at-risk")}
              empty="Nobody's gone quiet. 🎉"
              items={data.atRisk.map((l) => ({
                key: `${l.instructor.id}-${l.phone}`,
                main: l.name,
                sub: `${l.instructor.name} · last lesson ${shortDate(l.lastLesson)} · ${l.lessons} lesson${l.lessons === 1 ? "" : "s"}`,
                action: (
                  <a href={waLink(l.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:underline">
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                ),
              }))}
            />
            <ListCard
              title={`Unpaid lessons (${data.unpaidLessons.length})`}
              hint="Completed lessons with no payment recorded."
              onCsv={() => exportCsv("unpaid")}
              empty="Everything's paid."
              items={data.unpaidLessons.map((l) => ({
                key: l.bookingId,
                main: `${l.name} · ${pounds(l.amount)}`,
                sub: `${l.instructor.name} · ${shortDate(l.date)}, ${l.time}`,
              }))}
            />
            <ListCard
              title="Most hours this period"
              empty="No lessons in this period."
              items={data.topLearners.map((l) => ({
                key: `${l.instructor.id}-${l.phone}`,
                main: l.name,
                sub: l.instructor.name,
                action: <span className="text-sm font-semibold tabular-nums">{l.hours}h</span>,
              }))}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ListCard({
  title,
  hint,
  items,
  empty,
  onCsv,
}: {
  title: string;
  hint?: string;
  items: Array<{ key: string; main: string; sub: string; action?: React.ReactNode }>;
  empty: string;
  onCsv?: () => void;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {onCsv && items.length > 0 && (
          <Button size="sm" variant="ghost" onClick={onCsv}>
            <Download className="mr-1.5 h-4 w-4" /> CSV
          </Button>
        )}
      </CardHeader>
      <CardContent className="max-h-80 overflow-y-auto p-0">
        {items.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-slate-500">{empty}</p>
        ) : (
          <ul className="divide-y">
            {items.map((it) => (
              <li key={it.key} className="flex items-center justify-between gap-3 px-6 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{it.main}</p>
                  <p className="truncate text-xs text-slate-500">{it.sub}</p>
                </div>
                {it.action}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
