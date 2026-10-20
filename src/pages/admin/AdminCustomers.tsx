import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Phone,
  Calendar,
  CheckCircle2,
  Circle,
  Gift,
  Clock,
  Ban,
  RotateCcw,
  ShieldCheck,
  Building2,
  Users,
  Undo2,
  Trash2,
} from "lucide-react";
import AdminLayout, { StatusBadge, useStaff } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { adminApi, PLAN_LABELS, type CustomerDetail, type CustomerRow, type Pagination } from "@/lib/adminApi";

const STATUSES = [
  ["", "Any status"],
  ["paying", "Paying"],
  ["trialing", "Trialing"],
  ["past_due", "Payment failing"],
  ["canceled", "Canceled"],
  ["free", "Free (PDI)"],
  ["comped", "Comped"],
  ["school", "School instructor"],
  ["suspended", "Suspended"],
  ["deleted", "Deleted"],
  ["returning", "Came back after deleting"],
];

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

const selectClass = "h-9 rounded-md border bg-white px-2 text-sm";

export default function AdminCustomers() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const plan = params.get("plan") || "";
  const status = params.get("status") || "";
  const staff = params.get("staff") || "";
  const page = Number(params.get("page") || 1);
  const openId = params.get("open");

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page" && key !== "open") next.delete("page");
    setParams(next, { replace: true });
  };

  const load = useCallback(() => {
    setLoading(true);
    adminApi
      .customers({ search: params.get("q") || "", plan, status, staff, page })
      .then((r) => {
        setRows(r.data);
        setPagination(r.pagination || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [params, plan, status, staff, page]);

  useEffect(load, [load]);

  // Search as you type, after a short pause
  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get("q") || "") !== search) setParam("q", search);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <AdminLayout title="Customers" subtitle={pagination ? `${pagination.total} instructor${pagination.total === 1 ? "" : "s"}` : undefined}>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or phone" className="bg-white pl-9" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <select aria-label="Plan" value={plan} onChange={(e) => setParam("plan", e.target.value)} className={selectClass}>
            <option value="">Any plan</option>
            <option value="pdi">PDI</option>
            <option value="adi">ADI</option>
            <option value="driving-school">Driving School</option>
          </select>
          <select aria-label="Status" value={status} onChange={(e) => setParam("status", e.target.value)} className={selectClass}>
            {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select aria-label="Staff" value={staff} onChange={(e) => setParam("staff", e.target.value)} className={selectClass}>
            <option value="">Everyone</option>
            <option value="true">Staff only</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {loading && rows.length === 0 ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No customers match.</p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-sm md:table">
              <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Instructor</th>
                  <th className="px-4 py-2.5 font-medium">Plan</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Setup</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${loading ? "opacity-60" : ""}`}>
                {rows.map((r) => (
                  <tr key={r.id} onClick={() => setParam("open", r.id)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-4 py-2.5">
                      <p className="flex items-center gap-1.5 font-medium">
                        {r.name}
                        {r.staffRole && <ShieldCheck className="h-3.5 w-3.5 text-violet-600" aria-label={`Staff: ${r.staffRole}`} />}
                        <ReturningBadge row={r} />
                      </p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {PLAN_LABELS[r.plan]}
                      {r.schoolRole && <span className="ml-1 text-xs capitalize text-muted-foreground">({r.schoolRole === "member" ? "instructor" : r.schoolRole})</span>}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5"><SetupIcons row={r} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{date(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Phone list */}
            <ul className="divide-y md:hidden">
              {rows.map((r) => (
                <li key={r.id}>
                  <button onClick={() => setParam("open", r.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate font-medium">{r.name} <ReturningBadge row={r} /></p>
                      <p className="truncate text-xs text-muted-foreground">{r.email}</p>
                      <div className="mt-1"><SetupIcons row={r} /></div>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusBadge status={r.status} />
                      <p className="mt-1 text-xs text-muted-foreground">{PLAN_LABELS[r.plan]}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button size="icon" variant="outline" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setParam("page", String(page + 1))} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CustomerSheet id={openId} onClose={() => setParam("open", "")} onChanged={load} onOpen={(id) => setParam("open", id)} />
    </AdminLayout>
  );
}

function ReturningBadge({ row }: { row: CustomerRow }) {
  if (!row.returning) return null;
  return (
    <span
      title="Signed up again after deleting an earlier account"
      className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800"
    >
      <Undo2 className="h-3 w-3" /> Returning
    </span>
  );
}

function SetupIcons({ row }: { row: CustomerRow }) {
  const item = (done: boolean, Icon: React.ElementType, label: string) => (
    <span title={`${label}: ${done ? "yes" : "no"}`} className={done ? "text-green-600" : "text-slate-300"}>
      <Icon className="h-4 w-4" />
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5">
      {item(row.hasNumber, Phone, "WhatsApp number")}
      {item(row.calendarConnected, Calendar, "Calendar")}
      {row.hasNumber && !row.donnaEnabled && <span className="text-[10px] font-semibold uppercase text-amber-600">Donna off</span>}
    </span>
  );
}

function CustomerSheet({
  id,
  onClose,
  onChanged,
  onOpen,
}: {
  id: string | null;
  onClose: () => void;
  onChanged: () => void;
  onOpen: (id: string) => void;
}) {
  const { can, me } = useStaff();
  const [c, setC] = useState<CustomerDetail | null>(null);
  const [busy, setBusy] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [comp, setComp] = useState({ plan: "adi", until: "", note: "" });
  const [confirmSuspend, setConfirmSuspend] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");

  const load = useCallback(() => {
    if (!id) return;
    setC(null);
    adminApi.customer(id).then(setC).catch((e) => toast.error(e.message));
  }, [id]);
  useEffect(load, [load]);

  async function act(label: string, fn: () => Promise<unknown>, success: string) {
    setBusy(label);
    try {
      await fn();
      toast.success(success);
      load();
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That didn't work");
    } finally {
      setBusy("");
    }
  }

  const isSelf = !!c && c.email === me?.email;

  return (
    <Sheet open={!!id} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {!c ? (
          <div className="flex justify-center py-20">
            <SheetTitle className="sr-only">Loading customer</SheetTitle>
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-5">
            <SheetHeader className="text-left">
              <SheetTitle className="flex flex-wrap items-center gap-2 pr-6">
                {c.name}
                <StatusBadge status={c.status} />
                {c.staffRole && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold capitalize text-violet-700">
                    <ShieldCheck className="h-3 w-3" /> {c.superAdmin ? "Super admin" : c.staffRole}
                  </span>
                )}
              </SheetTitle>
              <p className="text-sm text-muted-foreground">{c.email}</p>
            </SheetHeader>

            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
              <Field label="Plan" value={PLAN_LABELS[c.plan]} />
              <Field label="Subscription" value={c.subscriptionStatus?.replace("_", " ") || "—"} />
              <Field label="Joined" value={date(c.createdAt)} />
              <Field label="Trial ends" value={date(c.trialEndsAt)} />
              <Field label="WhatsApp" value={c.number?.phoneNumber || "Not assigned"} />
              <Field label="Timezone" value={c.timezone} />
              {c.comp && <Field label="Comped" value={`${PLAN_LABELS[c.comp.plan]} · ${c.comp.until ? `until ${date(c.comp.until)}` : "no end"}`} wide />}
              {c.school && <Field label="School" value={`${c.school.name} · ${c.school.role === "member" ? "instructor" : c.school.role}`} wide />}
            </dl>

            {c.deletedAt && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-medium">Deleted on {date(c.deletedAt)}</p>
                <p className="text-xs text-muted-foreground">They can't sign in to this account. It's kept here for your records only.</p>
                {c.rejoinedAs && (
                  <button onClick={() => onOpen(c.rejoinedAs!.id)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-violet-700 hover:underline">
                    <Undo2 className="h-3.5 w-3.5" /> Came back {date(c.rejoinedAs.createdAt)} with a new account →
                  </button>
                )}
              </div>
            )}

            {c.previousAccounts.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm">
                <p className="flex items-center gap-1.5 font-medium text-amber-900"><Undo2 className="h-4 w-4" /> Returning customer</p>
                <p className="text-xs text-amber-800">
                  They deleted {c.previousAccounts.length === 1 ? "an earlier account" : `${c.previousAccounts.length} earlier accounts`}. To them this is a brand-new account.
                </p>
                <ul className="mt-2 space-y-1">
                  {c.previousAccounts.map((p) => (
                    <li key={p.id}>
                      <button onClick={() => onOpen(p.id)} className="text-left text-xs text-amber-900 hover:underline">
                        {PLAN_LABELS[p.plan]} · joined {date(p.createdAt)} · deleted {date(p.deletedAt)} · {p.lessons} lessons →
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-center">
              <Mini value={c.usage.learners} label="Learners" />
              <Mini value={c.usage.lessonsTotal} label="Lessons" />
              <Mini value={c.usage.upcoming} label="Upcoming" />
            </div>

            <section>
              <h3 className="mb-2 text-sm font-semibold">Setup</h3>
              <ul className="space-y-1 text-sm">
                {c.setup.required.map((r) => (
                  <li key={r.key} className="flex items-center gap-2">
                    {r.done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                    {r.label}
                  </li>
                ))}
                <li className="flex items-center gap-2">
                  {c.calendarConnected ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
                  Google Calendar
                </li>
              </ul>
            </section>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/learners?instructor=${c.id}`}><Users className="mr-1.5 h-4 w-4" /> View learners</Link>
              </Button>
              {c.stripe && (
                <Button asChild size="sm" variant="outline">
                  <a href={c.stripe.url} target="_blank" rel="noreferrer"><ExternalLink className="mr-1.5 h-4 w-4" /> Stripe</a>
                </Button>
              )}
              {c.school && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> {c.school.seatLimit} seats</span>
              )}
            </div>

            {/* Actions */}
            {!c.deletedAt && can("admin.trials") && c.subscriptionStatus === "trialing" && (
              <Action title="Extend trial" icon={Clock}>
                <div className="flex gap-2">
                  <Input type="number" min={1} max={90} value={trialDays} onChange={(e) => setTrialDays(e.target.value)} className="w-24" aria-label="Days" />
                  <span className="self-center text-sm text-muted-foreground">days</span>
                  <Button
                    size="sm"
                    className="ml-auto"
                    disabled={!!busy}
                    onClick={() => act("trial", () => adminApi.extendTrial(c.id, Number(trialDays)), `Trial extended by ${trialDays} days`)}
                  >
                    {busy === "trial" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Extend
                  </Button>
                </div>
              </Action>
            )}

            {!c.deletedAt && can("admin.customers") && !["member", "manager"].includes(c.schoolRole || "") && (
              <Action title={c.comp ? "Comped plan" : "Comp a plan"} icon={Gift} hint="Free access without a subscription, e.g. for partners or beta testers.">
                {c.comp ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => act("uncomp", () => adminApi.removeComp(c.id), "Comp removed")}
                  >
                    Remove comp
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Plan</Label>
                        <select value={comp.plan} onChange={(e) => setComp({ ...comp, plan: e.target.value })} className={`${selectClass} w-full`}>
                          <option value="adi">ADI</option>
                          <option value="driving-school">Driving School</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Until (optional)</Label>
                        <Input type="date" value={comp.until} onChange={(e) => setComp({ ...comp, until: e.target.value })} />
                      </div>
                    </div>
                    <Input placeholder="Note, e.g. Beta tester" value={comp.note} onChange={(e) => setComp({ ...comp, note: e.target.value })} />
                    <Button
                      size="sm"
                      disabled={!!busy}
                      onClick={() =>
                        act("comp", () => adminApi.comp(c.id, { ...comp, until: comp.until ? new Date(`${comp.until}T23:59:59`).toISOString() : null }), "Plan comped")
                      }
                    >
                      {busy === "comp" && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Comp {PLAN_LABELS[comp.plan]}
                    </Button>
                  </div>
                )}
              </Action>
            )}

            {!c.deletedAt && can("admin.customers") && !c.superAdmin && !isSelf && (
              <Action title={c.suspended ? "Suspended" : "Suspend account"} icon={c.suspended ? RotateCcw : Ban} hint="Suspended accounts can't sign in. Their data is kept.">
                {c.suspended ? (
                  <Button size="sm" variant="outline" disabled={!!busy} onClick={() => act("reactivate", () => adminApi.reactivate(c.id), "Account reactivated")}>
                    Reactivate
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => setConfirmSuspend(true)}>
                    Suspend
                  </Button>
                )}
              </Action>
            )}

            {!c.deletedAt && can("admin.customers") && !c.superAdmin && !isSelf && (
              <Action
                title="Delete account"
                icon={Trash2}
                hint="The same as them deleting it themselves. They can sign up again with the same Google account and start fresh."
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setDeleteText("");
                    setConfirmDelete(true);
                  }}
                >
                  Delete
                </Button>
              </Action>
            )}

            {c.history.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-semibold">History</h3>
                <ul className="space-y-1.5 text-xs">
                  {c.history.map((h) => (
                    <li key={h._id} className="flex gap-2">
                      <span className="shrink-0 text-muted-foreground">{date(h.createdAt)}</span>
                      <span><strong>{h.action}</strong> by {h.actor}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        <AlertDialog open={confirmSuspend} onOpenChange={setConfirmSuspend}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Suspend {c?.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                They won't be able to sign in and Donna stops answering for them. Their Stripe subscription isn't cancelled; do that in Stripe if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => c && act("suspend", () => adminApi.suspend(c.id), "Account suspended")}
              >
                Suspend
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {c?.name}'s account?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-2">
                  <p>This can't be undone. It's the same as them pressing "Delete account" on their dashboard:</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>their Stripe subscription is cancelled</li>
                    <li>their WhatsApp number goes back to the pool</li>
                    <li>their name, email, Google sign-in and calendar connection are removed</li>
                  </ul>
                  <p>If they sign in again with Google, they start a brand new account.</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-1.5">
              <label htmlFor="confirm-delete" className="text-sm font-medium">Type DELETE to confirm</label>
              <Input id="confirm-delete" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" placeholder="DELETE" />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteText !== "DELETE" || !!busy}
                onClick={() => c && act("delete", () => adminApi.deleteCustomer(c.id), `${c.name}'s account deleted`)}
              >
                Delete account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value, wide }: { label: string; value: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border py-2">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Action({ title, hint, icon: Icon, children }: { title: string; hint?: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border p-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-violet-600" /> {title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}
