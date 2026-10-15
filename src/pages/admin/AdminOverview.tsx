import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  PoundSterling,
  Users,
  Sparkles,
  Building2,
  Phone,
  CalendarCheck,
  AlertTriangle,
  Loader2,
  TrendingDown,
  GraduationCap,
  Undo2,
} from "lucide-react";
import AdminLayout, { StatCard, StatusBadge } from "@/components/admin/AdminLayout";
import { adminApi, gbp, PLAN_LABELS, type Overview } from "@/lib/adminApi";

const short = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export default function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.overview().then(setData).catch((e) => setError(e.message));
  }, []);

  return (
    <AdminLayout title="Overview" subtitle="How Donna Drive is doing right now">
      {error ? (
        <p className="rounded-xl border bg-white p-6 text-sm text-red-600">{error}</p>
      ) : !data ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <Body data={data} />
      )}
    </AdminLayout>
  );
}

function Body({ data }: { data: Overview }) {
  const { revenue, instructors } = data;
  const planTotal = Object.values(instructors.byPlan).reduce((a, b) => a + b, 0) || 1;
  const funnelTop = data.funnel[0]?.count || 1;

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="MRR" value={gbp(revenue.mrr)} hint={`${gbp(revenue.arr)} a year · list price`} icon={PoundSterling} tone="green" />
        <StatCard label="Paying" value={revenue.paying} hint={`${revenue.trialing} on trial · ${revenue.comped} comped`} icon={Sparkles} tone="violet" />
        <StatCard label="Instructors" value={instructors.total} hint={`${data.signupsLast30} new in 30 days`} icon={Users} tone="sky" />
        <StatCard
          label="Churned (30d)"
          value={revenue.canceledLast30}
          hint={revenue.pastDue ? `${revenue.pastDue} payment${revenue.pastDue === 1 ? "" : "s"} failing` : "No failed payments"}
          icon={TrendingDown}
          tone={revenue.pastDue ? "amber" : "slate"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Sign-ups chart */}
        <section className="rounded-xl border bg-white p-4 lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-semibold">Sign-ups</h2>
            <p className="text-xs text-muted-foreground">Last 30 days · {data.signupsLast30} total</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.signups} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="signups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={short} tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(d) => short(String(d))} formatter={(v) => [v, "Sign-ups"]} />
                <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#signups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Plan mix */}
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-4 font-semibold">Plans</h2>
          <div className="space-y-3">
            {["pdi", "adi", "driving-school"].map((slug) => {
              const n = instructors.byPlan[slug] || 0;
              return (
                <div key={slug}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{PLAN_LABELS[slug]}</span>
                    <span className="tabular-nums text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-violet-500" style={{ width: `${(n / planTotal) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-lg font-bold">{data.schools.total}</p>
              <p className="text-muted-foreground">Schools</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <p className="text-lg font-bold">{data.schools.instructors}</p>
              <p className="text-muted-foreground">School instructors</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Setup funnel */}
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-4 font-semibold">Setup funnel</h2>
          <ol className="space-y-3">
            {data.funnel.map((step, i) => (
              <li key={step.key}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{i + 1}. {step.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {step.count} <span className="text-xs">({Math.round((step.count / funnelTop) * 100)}%)</span>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-sky-500" style={{ width: `${(step.count / funnelTop) * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
          {data.donnaOff > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" /> {data.donnaOff} instructor{data.donnaOff === 1 ? " has" : "s have"} Donna switched off
            </p>
          )}
        </section>

        {/* Operations */}
        <section className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-3">
          <StatCard
            label="Numbers free"
            value={data.numbers.available}
            hint={`${data.numbers.assigned} in use`}
            icon={Phone}
            tone={data.numbers.available < 3 ? "red" : "green"}
          />
          <StatCard label="Lessons next 7 days" value={data.lessons.next7Days} hint={`${data.lessons.last30Days} in the last 30`} icon={CalendarCheck} tone="sky" />
          <StatCard label="Learners" value={data.learners} hint="Across all instructors" icon={GraduationCap} tone="violet" />
          <StatCard label="School seats" value={data.schools.seats} hint={`${data.schools.extraSeats} paid extra`} icon={Building2} />
          <StatCard label="On trial" value={revenue.trialing} hint={`${data.trialsEnding.length} ending this week`} icon={Sparkles} tone="amber" />
          <StatCard
            label="Came back"
            value={instructors.returning}
            hint={`${instructors.deletedLast30} deleted in 30 days · ${instructors.suspended} suspended`}
            icon={Undo2}
            tone="amber"
          />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PeopleList title="Recent sign-ups" people={data.recentSignups} when={(p) => `Joined ${short(p.createdAt)}`} />
        <PeopleList
          title="Trials ending this week"
          people={data.trialsEnding}
          when={(p) => (p.trialEndsAt ? `Ends ${short(p.trialEndsAt)}` : "")}
          empty="No trials end in the next 7 days."
        />
      </div>
    </div>
  );
}

function PeopleList({
  title,
  people,
  when,
  empty = "Nobody yet.",
}: {
  title: string;
  people: Overview["recentSignups"];
  when: (p: Overview["recentSignups"][number]) => string;
  empty?: string;
}) {
  return (
    <section className="rounded-xl border bg-white">
      <h2 className="border-b px-4 py-3 font-semibold">{title}</h2>
      {people.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y">
          {people.map((p) => (
            <li key={p.id}>
              <Link to={`/admin/customers?open=${p.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={p.status} />
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{PLAN_LABELS[p.plan]} · {when(p)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
