import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { CalendarDays, ChevronDown, Download, Loader2, Megaphone, Rocket, Search, Send, Star, Trash2, X } from "lucide-react";
import AdminLayout, { useStaff } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminApi, type LaunchSettings, type WaitlistRow, type WaitlistStats } from "@/lib/adminApi";

const MODES: { value: LaunchSettings["mode"]; label: string; help: string }[] = [
  { value: "waitlist", label: "Waitlist", help: "Sign-up is closed. Buttons say “Join the waitlist”. New accounts need an invite." },
  { value: "invite", label: "Invite only", help: "Same as Waitlist, while you let people in in batches." },
  { value: "open", label: "Open", help: "Anyone can sign up. Buttons say “Get started”. The banner hides itself." },
];
const TYPE_LABEL: Record<string, string> = { adi: "ADI", pdi: "PDI", school: "School" };
const STATUS_STYLE: Record<string, string> = {
  waiting: "bg-slate-100 text-slate-700",
  invited: "bg-sky-100 text-sky-700",
  joined: "bg-green-100 text-green-700",
  removed: "bg-red-50 text-red-600",
};
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const launchDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
const selectClass = "h-9 rounded-md border bg-white px-2 text-sm";

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function PerDay({ days }: { days: WaitlistStats["perDay"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  if (!days.length) return <p className="py-6 text-center text-xs text-muted-foreground">No sign-ups in the last 30 days</p>;
  return (
    <div className="flex h-16 items-end gap-[3px]" aria-label="Sign-ups per day">
      {days.map((d) => (
        <div key={d.date} title={`${shortDate(d.date)}: ${d.count}`} className="flex-1 rounded-t bg-violet-400/80" style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }} />
      ))}
    </div>
  );
}

/** Mode, launch date, banner, invite perk and referral cap. */
function LaunchCard({ settings, onSaved, canEdit }: { settings: LaunchSettings; onSaved: (s: LaunchSettings) => void; canEdit: boolean }) {
  const [form, setForm] = useState({
    date: settings.date || "",
    message: settings.message || "",
    invitePromoCode: settings.invitePromoCode || "",
    maxFreeMonths: String(settings.maxFreeMonths),
  });
  const [confirmMode, setConfirmMode] = useState<LaunchSettings["mode"] | null>(null);
  const [announce, setAnnounce] = useState(false);
  const [busy, setBusy] = useState(false);
  // Folded to a one-line summary by default; remembers if it was left open
  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem("dd_admin_launch_open") === "1";
    } catch {
      return false;
    }
  });
  function toggle() {
    setExpanded((v) => {
      try {
        localStorage.setItem("dd_admin_launch_open", v ? "0" : "1");
      } catch {
        /* private mode */
      }
      return !v;
    });
  }

  useEffect(() => {
    setForm({ date: settings.date || "", message: settings.message || "", invitePromoCode: settings.invitePromoCode || "", maxFreeMonths: String(settings.maxFreeMonths) });
  }, [settings]);

  const dirty =
    form.date !== (settings.date || "") ||
    form.message !== (settings.message || "") ||
    form.invitePromoCode !== (settings.invitePromoCode || "") ||
    form.maxFreeMonths !== String(settings.maxFreeMonths);

  async function save(body: Parameters<typeof adminApi.updateLaunch>[0], done: string) {
    setBusy(true);
    try {
      onSaved(await adminApi.updateLaunch(body));
      toast.success(done);
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function sendAnnouncement() {
    setBusy(true);
    try {
      const r = await adminApi.announceLaunch();
      toast.success(`Launch email sent to ${r.sent} of ${r.of} people`);
      setAnnounce(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send it");
    } finally {
      setBusy(false);
    }
  }

  const preview = settings.mode === "open" ? null : form.message || (form.date ? `Launching ${launchDay(form.date)} · Join the waitlist →` : null);

  return (
    <section className="rounded-xl border bg-white">
      <h2 className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
        <Rocket className="h-4 w-4 text-violet-600" /> Launch settings
        {!canEdit && <span className="ml-auto text-xs font-normal text-muted-foreground">Only admins can change these</span>}
      </h2>

      {/* The sign-up switch is always in view; the rest folds away */}
      <div className="px-4 pt-4">
        <div>
          <Label className="text-xs">Sign-up</Label>
          <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1" role="radiogroup" aria-label="Launch mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={settings.mode === m.value}
                disabled={!canEdit || busy}
                onClick={() => m.value !== settings.mode && setConfirmMode(m.value)}
                className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                  settings.mode === m.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                } disabled:cursor-not-allowed`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">{MODES.find((m) => m.value === settings.mode)?.help}</p>
        </div>

      </div>

      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        className={`mt-3 flex w-full flex-wrap items-center gap-x-2 gap-y-1 border-t px-4 py-3 text-left text-sm transition-colors hover:bg-slate-50 ${expanded ? "" : "rounded-b-xl"}`}
      >
        <span className="font-medium text-slate-800">Launch date, banner and perks</span>
        <span className="text-xs text-muted-foreground">
          {settings.date ? `Launching ${launchDay(settings.date)}` : "No launch date"}
          {" · "}
          {settings.invitePromoCode ? `Perk ${settings.invitePromoCode}` : "No invite perk"}
        </span>
        <ChevronDown className={`ml-auto h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="launch-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
      <div className="space-y-5 px-4 pb-4 pt-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="launch-date" className="text-xs">Launch date</Label>
            <div className="mt-1 flex gap-2">
              <Input id="launch-date" type="date" value={form.date} disabled={!canEdit} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="h-9" />
              {form.date && canEdit && (
                <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setForm((f) => ({ ...f, date: "" }))}>
                  <X className="mr-1 h-3.5 w-3.5" /> Clear
                </Button>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Empty: no date anywhere on the site.</p>
          </div>
          <div>
            <Label htmlFor="launch-message" className="text-xs">Banner text (optional)</Label>
            <Input
              id="launch-message"
              value={form.message}
              maxLength={140}
              disabled={!canEdit}
              placeholder="e.g. 20% off for everyone on the waitlist"
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              className="mt-1 h-9"
            />
            <p className="mt-1 text-xs text-muted-foreground">Replaces “Launching …” in the banner.</p>
          </div>
          <div>
            <Label htmlFor="invite-perk" className="text-xs">Invite perk</Label>
            <select
              id="invite-perk"
              className={`${selectClass} mt-1 w-full`}
              value={form.invitePromoCode}
              disabled={!canEdit}
              onChange={(e) => setForm((f) => ({ ...f, invitePromoCode: e.target.value }))}
            >
              <option value="">None</option>
              {settings.promoCodes.map((p) => (
                <option key={p.code} value={p.code}>{p.code} · {p.label}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied automatically at checkout for people you invite. <Link to="/admin/sales" className="text-violet-600 hover:underline">Create a code</Link>
            </p>
          </div>
          <div>
            <Label htmlFor="max-months" className="text-xs">Referral free months cap (per person)</Label>
            <Input id="max-months" type="number" min={0} max={60} value={form.maxFreeMonths} disabled={!canEdit} onChange={(e) => setForm((f) => ({ ...f, maxFreeMonths: e.target.value }))} className="mt-1 h-9" />
            <p className="mt-1 text-xs text-muted-foreground">A friend who starts paying earns you both a month free, up to this many.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-medium text-slate-700">Banner preview</p>
            {preview ? (
              <p className="mt-1 truncate rounded bg-slate-900 px-3 py-1.5 text-center text-white">{preview}</p>
            ) : (
              <p className="mt-1 text-muted-foreground">{settings.mode === "open" ? "Hidden while sign-up is open." : "No banner (no date or text set)."}</p>
            )}
          </div>
          {canEdit && (
            <Button
              size="sm"
              disabled={!dirty || busy}
              onClick={() =>
                save(
                  { date: form.date || null, message: form.message, invitePromoCode: form.invitePromoCode || null, maxFreeMonths: Number(form.maxFreeMonths) },
                  "Launch settings saved"
                )
              }
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          )}
        </div>

        {settings.mode === "open" && canEdit && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed p-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm text-slate-700">
              <Megaphone className="mr-1.5 inline h-4 w-4 text-violet-600" />
              Tell everyone still waiting (who said yes to product news) that sign-up is open. Each person gets it once.
            </p>
            <Button size="sm" variant="outline" onClick={() => setAnnounce(true)}>Send launch email</Button>
          </div>
        )}
      </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={!!confirmMode} onOpenChange={(o) => !o && setConfirmMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Switch sign-up to “{MODES.find((m) => m.value === confirmMode)?.label}”?</DialogTitle>
            <DialogDescription>{MODES.find((m) => m.value === confirmMode)?.help} This changes the live website within a minute.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmMode(null)}>Cancel</Button>
            <Button
              disabled={busy}
              onClick={async () => {
                if (confirmMode && (await save({ mode: confirmMode }, `Sign-up is now ${MODES.find((m) => m.value === confirmMode)?.label}`))) setConfirmMode(null);
              }}
            >
              Switch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={announce} onOpenChange={setAnnounce}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send the launch email?</DialogTitle>
            <DialogDescription>
              “Donna Drive is live” goes to everyone still waiting or invited who ticked “email me product news” and hasn't unsubscribed. It can't be unsent.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnounce(false)}>Cancel</Button>
            <Button disabled={busy} onClick={sendAnnouncement}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default function AdminWaitlist() {
  return (
    <AdminLayout title="Waitlist" subtitle="Who's waiting, who to let in, and when sign-up opens" permission="admin.waitlist">
      <WaitlistBody />
    </AdminLayout>
  );
}

// Inside AdminLayout, so the signed-in staff member is known
function WaitlistBody() {
  const canEditLaunch = useStaff().can("admin.launch");
  const [settings, setSettings] = useState<LaunchSettings | null>(null);
  const [rows, setRows] = useState<WaitlistRow[] | null>(null);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: "waiting", type: "", search: "", page: 1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [inviteOpen, setInviteOpen] = useState<null | { ids?: string[]; next?: number; type?: string }>(null);
  const [nextN, setNextN] = useState("20");
  const [sending, setSending] = useState(false);
  const limit = 50;

  const load = useCallback(() => {
    adminApi
      .waitlist({ ...filters, limit })
      .then((r) => {
        setRows(r.data);
        setTotal(r.total);
        setStats(r.stats);
      })
      .catch((e) => toast.error(e.message));
  }, [filters]);

  useEffect(load, [load]);
  useEffect(() => {
    adminApi.launch().then(setSettings).catch(() => {});
  }, []);
  useEffect(() => setSelected(new Set()), [filters]);

  const invitable = useMemo(() => (rows ?? []).filter((r) => r.status === "waiting" || (r.status === "invited" && r.invite?.expired)), [rows]);
  const allChecked = invitable.length > 0 && invitable.every((r) => selected.has(r.id));

  async function sendInvites() {
    if (!inviteOpen) return;
    setSending(true);
    try {
      const r = await adminApi.inviteWaitlist(inviteOpen);
      toast.success(`Invited ${r.invited}${r.failed.length ? ` (${r.failed.length} emails didn't send)` : ""}`);
      setInviteOpen(null);
      setSelected(new Set());
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't send invites");
    } finally {
      setSending(false);
    }
  }

  async function remove(r: WaitlistRow) {
    try {
      await adminApi.removeFromWaitlist(r.id);
      toast.success(`${r.email} removed`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove");
    }
  }

  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const perk = settings?.invitePromoCode ? settings.promoCodes.find((p) => p.code === settings.invitePromoCode) : null;
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {settings && <LaunchCard settings={settings} onSaved={setSettings} canEdit={canEditLaunch} />}

      {stats && (
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="On the list" value={stats.total} sub={Object.entries(stats.byType).map(([k, v]) => `${TYPE_LABEL[k] || "Not said"} ${v}`).join(" · ")} />
            <Stat label="Waiting" value={stats.waiting} />
            <Stat label="Invited" value={stats.invited} />
            <Stat label="Signed up" value={stats.joined} />
            <Stat label="Invite → sign-up" value={stats.conversion == null ? "—" : `${stats.conversion}%`} />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-3 sm:col-span-2">
              <p className="mb-2 text-xs text-muted-foreground">Joins per day (30 days)</p>
              <PerDay days={stats.perDay} />
            </div>
            <div className="rounded-xl border bg-white p-3">
              <p className="mb-2 text-xs text-muted-foreground">Top referrers</p>
              {stats.topReferrers.length === 0 ? (
                <p className="text-sm text-muted-foreground">None yet</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {stats.topReferrers.map((t) => (
                    <li key={t.email} className="flex justify-between gap-2">
                      <span className="truncate">{t.name}</span>
                      <span className="tabular-nums text-muted-foreground">{t.referrals}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b p-3 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-1">
            {["waiting", "invited", "joined", "all", "removed"].map((s) => (
              <button
                key={s}
                onClick={() => setFilters((f) => ({ ...f, status: s, page: 1 }))}
                className={`rounded-full px-3 py-1 text-sm capitalize ${filters.status === s ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-1 gap-2 lg:justify-end">
            <select aria-label="Type" className={selectClass} value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))}>
              <option value="">Everyone</option>
              <option value="adi">ADIs</option>
              <option value="pdi">PDIs</option>
              <option value="school">Schools</option>
            </select>
            <div className="relative min-w-0 flex-1 lg:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Name, email or code"
                className="h-9 pl-8"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
            <Button size="sm" variant="outline" className="h-9 shrink-0" onClick={() => adminApi.exportWaitlist().catch((e) => toast.error(e.message))}>
              <Download className="h-4 w-4 sm:mr-1.5" /> <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-b bg-slate-50 px-3 py-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Invite the next</span>
            <Input type="number" min={1} max={500} value={nextN} onChange={(e) => setNextN(e.target.value)} className="h-8 w-16" aria-label="How many" />
            <span className="text-muted-foreground">in line</span>
            <Button size="sm" className="h-8" disabled={!Number(nextN)} onClick={() => setInviteOpen({ next: Number(nextN), type: filters.type || undefined })}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Invite
            </Button>
          </div>
          {selected.size > 0 && (
            <Button size="sm" variant="secondary" className="h-8 sm:ml-auto" onClick={() => setInviteOpen({ ids: [...selected] })}>
              Invite {selected.size} selected
            </Button>
          )}
        </div>

        {!rows ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted-foreground">Nobody here yet.</p>
        ) : (
          <>
            <div className="hidden grid-cols-[28px_56px_minmax(0,2fr)_minmax(0,1fr)_72px_80px_96px_36px] gap-3 border-b px-3 py-2 text-xs font-medium text-muted-foreground md:grid">
              <Checkbox
                aria-label="Select all"
                checked={allChecked}
                disabled={!invitable.length}
                onCheckedChange={(v) => setSelected(v ? new Set(invitable.map((r) => r.id)) : new Set())}
              />
              <span>Place</span>
              <span>Who</span>
              <span>Type · area</span>
              <span>Referrals</span>
              <span>Joined</span>
              <span>Status</span>
              <span />
            </div>
            <ul className="divide-y">
              {rows.map((r) => {
                const canInvite = r.status === "waiting" || (r.status === "invited" && r.invite?.expired);
                return (
                  <li key={r.id} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm md:grid-cols-[28px_56px_minmax(0,2fr)_minmax(0,1fr)_72px_80px_96px_36px]">
                    <Checkbox aria-label={`Select ${r.email}`} checked={selected.has(r.id)} disabled={!canInvite} onCheckedChange={() => toggle(r.id)} />
                    <span className="hidden font-semibold tabular-nums md:block">{r.place ? `#${r.place}` : <span className="text-muted-foreground">—</span>}</span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {r.place && <span className="tabular-nums text-muted-foreground md:hidden">#{r.place} </span>}
                        {r.name}
                        {r.priority && <Star className="ml-1 inline h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="Priority" />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.email}
                        {r.source?.utm_source && <> · {r.source.utm_source}</>}
                        {r.unsubscribed && <> · unsubscribed</>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {[r.type && TYPE_LABEL[r.type], r.schoolSize, r.area, r.referrals ? `${r.referrals} referral${r.referrals === 1 ? "" : "s"}` : null, `joined ${shortDate(r.joinedAt)}`].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="hidden truncate text-muted-foreground md:block">
                      {[r.type && TYPE_LABEL[r.type], r.schoolSize, r.area].filter(Boolean).join(" · ") || "—"}
                    </span>
                    <span className="hidden tabular-nums md:block">{r.referrals || "—"}</span>
                    <span className="hidden text-muted-foreground md:block">{shortDate(r.joinedAt)}</span>
                    <span className="justify-self-end md:justify-self-start">
                      <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${r.invite?.expired && r.status === "invited" ? "bg-amber-100 text-amber-700" : STATUS_STYLE[r.status]}`}>
                        {r.status === "invited" && r.invite?.expired ? "Invite expired" : r.status === "joined" ? "Signed up" : r.status[0].toUpperCase() + r.status.slice(1)}
                      </span>
                    </span>
                    <span className="hidden md:block">
                      {r.status !== "joined" && r.status !== "removed" && (
                        <button aria-label={`Remove ${r.email}`} title="Remove (spam or duplicate)" className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => remove(r)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            {pages > 1 && (
              <div className="flex items-center justify-between border-t px-3 py-2 text-sm">
                <span className="text-muted-foreground">{total} people</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={filters.page <= 1} onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</Button>
                  <Button size="sm" variant="outline" disabled={filters.page >= pages} onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5" /> Invites last 14 days. Anyone who hasn't used theirs after 5 days gets one reminder.
      </p>

      <Dialog open={!!inviteOpen} onOpenChange={(o) => !o && setInviteOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {inviteOpen?.ids ? `Invite ${inviteOpen.ids.length} ${inviteOpen.ids.length === 1 ? "person" : "people"}?` : `Invite the next ${inviteOpen?.next}${inviteOpen?.type ? ` ${TYPE_LABEL[inviteOpen.type]}s` : ""} in line?`}
            </DialogTitle>
            <DialogDescription>
              Each gets an email with their own sign-up link, valid for 14 days.
              {perk ? ` Their invite includes ${perk.code} (${perk.label}), applied at checkout.` : " No launch perk is set."}
              {!inviteOpen?.ids && " Priority people (3+ referrals) go first, then people who answered the questions, then by place."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(null)}>Cancel</Button>
            <Button disabled={sending} onClick={sendInvites}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send invites"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
