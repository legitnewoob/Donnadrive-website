import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, PartyPopper, Ticket, Copy, Power } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { adminApi, describeDiscount, type PromoCode, type Sale } from "@/lib/adminApi";

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");
const dayInput = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => new Date(Date.now() + n * 86400000);

// One-click starting points for the usual festive sales (dates for the next one)
function nextDate(month: number, day: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), month, day);
  return d < now ? new Date(now.getFullYear() + 1, month, day) : d;
}
function blackFriday() {
  const now = new Date();
  for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
    const nov1 = new Date(y, 10, 1);
    const fri = new Date(y, 10, 1 + ((5 - nov1.getDay() + 7) % 7) + 21);
    if (new Date(y, 10, fri.getDate() + 4) > now) return fri;
  }
  return addDays(30);
}
const PRESETS = [
  { name: "Black Friday", banner: "🖤 Black Friday: 40% off for 3 months", percentOff: "40", months: "3", start: () => blackFriday(), days: 4 },
  { name: "Christmas", banner: "🎄 Christmas sale: 30% off for 3 months", percentOff: "30", months: "3", start: () => nextDate(11, 1), days: 31 },
  { name: "New Year", banner: "🎉 New Year, new learners: 25% off for 2 months", percentOff: "25", months: "2", start: () => nextDate(0, 1), days: 14 },
  { name: "Diwali", banner: "🪔 Diwali offer: 30% off for 2 months", percentOff: "30", months: "2", start: () => addDays(1), days: 7 },
  { name: "Summer", banner: "☀️ Summer offer: first month half price", percentOff: "50", months: "", start: () => nextDate(6, 1), days: 31, once: true },
];

const emptySale = () => ({
  name: "",
  bannerText: "",
  kind: "percent" as "percent" | "amount",
  value: "",
  duration: "repeating" as "once" | "repeating" | "forever",
  months: "3",
  plans: [] as string[],
  startsAt: dayInput(new Date()),
  endsAt: dayInput(addDays(14)),
});

function saleState(s: Sale) {
  const now = Date.now();
  if (!s.active || new Date(s.endsAt).getTime() <= now) return { label: "Ended", cls: "bg-slate-100 text-slate-600" };
  if (new Date(s.startsAt).getTime() > now) return { label: "Scheduled", cls: "bg-sky-100 text-sky-700" };
  return { label: "Live", cls: "bg-green-100 text-green-700" };
}

export default function AdminSales() {
  const [sales, setSales] = useState<Sale[] | null>(null);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [saleOpen, setSaleOpen] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  const load = () => {
    adminApi.sales().then(setSales).catch((e) => toast.error(e.message));
    adminApi.promoCodes().then(setCodes).catch(() => {});
  };
  useEffect(load, []);

  async function endSale(s: Sale) {
    try {
      await adminApi.endSale(s._id);
      toast.success(`${s.name} ended. People who already got the discount keep it.`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't end the sale");
    }
  }

  async function deactivate(c: PromoCode) {
    try {
      await adminApi.deactivatePromoCode(c._id);
      toast.success(`${c.code} can't be used any more`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't deactivate");
    }
  }

  return (
    <AdminLayout
      title="Sales & codes"
      subtitle="Sales apply automatically at checkout and show on the pricing page. Codes are typed in at checkout."
      permission="admin.sales"
      actions={
        <>
          <Button size="sm" variant="outline" onClick={() => setCodeOpen(true)}><Ticket className="mr-1.5 h-4 w-4" /> New code</Button>
          <Button size="sm" onClick={() => setSaleOpen(true)}><Plus className="mr-1.5 h-4 w-4" /> New sale</Button>
        </>
      }
    >
      {!sales ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border bg-white">
            <h2 className="flex items-center gap-2 border-b px-4 py-3 font-semibold"><PartyPopper className="h-4 w-4 text-violet-600" /> Sales</h2>
            {sales.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No sales yet.{" "}
                <button className="font-medium text-violet-600 hover:underline" onClick={() => setSaleOpen(true)}>Start one</button>
              </div>
            ) : (
              <ul className="divide-y">
                {sales.map((s) => {
                  const st = saleState(s);
                  return (
                    <li key={s._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-2 font-medium">
                          {s.name}
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${st.cls}`}>{st.label}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">{describeDiscount(s)}</p>
                        <p className="text-xs text-muted-foreground">
                          {date(s.startsAt)} – {date(s.endsAt)}{s.bannerText && <> · “{s.bannerText}”</>}
                        </p>
                      </div>
                      {st.label !== "Ended" && (
                        <Button size="sm" variant="outline" onClick={() => endSale(s)}>
                          <Power className="mr-1.5 h-3.5 w-3.5" /> End now
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-xl border bg-white">
            <h2 className="flex items-center gap-2 border-b px-4 py-3 font-semibold"><Ticket className="h-4 w-4 text-violet-600" /> Promo codes</h2>
            <p className="border-b bg-slate-50 px-4 py-2 text-xs text-muted-foreground">
              Stripe allows one discount per checkout, so codes can't be used on a plan while a sale is running for it.
            </p>
            {codes.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No codes yet.</p>
            ) : (
              <ul className="divide-y">
                {codes.map((c) => (
                  <li key={c._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2">
                        <code className="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-semibold">{c.code}</code>
                        <button
                          aria-label={`Copy ${c.code}`}
                          className="text-slate-400 hover:text-slate-700"
                          onClick={() => navigator.clipboard.writeText(c.code).then(() => toast.success("Copied"))}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {!c.active && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Off</span>}
                      </p>
                      <p className="text-sm text-muted-foreground">{describeDiscount(c)}</p>
                      <p className="text-xs text-muted-foreground">
                        Used {c.timesRedeemed ?? "?"}{c.maxRedemptions ? ` of ${c.maxRedemptions}` : ""} times
                        {c.expiresAt && <> · expires {date(c.expiresAt)}</>}
                      </p>
                    </div>
                    {c.active && <Button size="sm" variant="outline" onClick={() => deactivate(c)}>Deactivate</Button>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      <SaleDialog open={saleOpen} onOpenChange={setSaleOpen} onCreated={load} />
      <CodeDialog open={codeOpen} onOpenChange={setCodeOpen} onCreated={load} />
    </AdminLayout>
  );
}

const selectClass = "h-9 w-full rounded-md border bg-white px-2 text-sm";

function PlanPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (p: string) => onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  return (
    <div>
      <Label className="text-xs">Plans</Label>
      <div className="mt-1 flex flex-wrap gap-2">
        {[["adi", "ADI"], ["driving-school", "Driving School"]].map(([slug, label]) => (
          <button
            type="button"
            key={slug}
            onClick={() => toggle(slug)}
            className={`rounded-full border px-3 py-1 text-sm ${value.includes(slug) ? "border-violet-500 bg-violet-50 text-violet-700" : "text-slate-600"}`}
          >
            {label}
          </button>
        ))}
        <span className="self-center text-xs text-muted-foreground">{value.length ? "" : "None picked = all paid plans"}</span>
      </div>
    </div>
  );
}

function DiscountFields({
  f,
  setF,
}: {
  f: { kind: "percent" | "amount"; value: string; duration: "once" | "repeating" | "forever"; months: string };
  setF: (patch: Partial<typeof f>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <Label className="text-xs">Discount</Label>
        <div className="flex gap-1">
          <Input type="number" min={1} value={f.value} onChange={(e) => setF({ value: e.target.value })} placeholder={f.kind === "percent" ? "30" : "5"} />
          <select value={f.kind} onChange={(e) => setF({ kind: e.target.value as "percent" | "amount" })} className="h-9 rounded-md border bg-white px-2 text-sm" aria-label="Discount type">
            <option value="percent">%</option>
            <option value="amount">£</option>
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs">For</Label>
        <div className="flex gap-1">
          <select value={f.duration} onChange={(e) => setF({ duration: e.target.value as "once" | "repeating" | "forever" })} className={selectClass} aria-label="Duration">
            <option value="once">First month</option>
            <option value="repeating">Months…</option>
            <option value="forever">Forever</option>
          </select>
          {f.duration === "repeating" && (
            <Input type="number" min={1} max={36} value={f.months} onChange={(e) => setF({ months: e.target.value })} className="w-16" aria-label="Months" />
          )}
        </div>
      </div>
    </div>
  );
}

function discountBody(f: { kind: "percent" | "amount"; value: string; duration: "once" | "repeating" | "forever"; months: string }) {
  const v = Number(f.value);
  return {
    percentOff: f.kind === "percent" ? v : null,
    amountOff: f.kind === "amount" ? Math.round(v * 100) : null,
    duration: f.duration,
    durationMonths: f.duration === "repeating" ? Number(f.months) : null,
  };
}

function SaleDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const [f, setF] = useState(emptySale);
  const [saving, setSaving] = useState(false);
  const patch = (p: Partial<ReturnType<typeof emptySale>>) => setF((x) => ({ ...x, ...p }));

  useEffect(() => { if (open) setF(emptySale()); }, [open]);

  function preset(p: (typeof PRESETS)[number]) {
    const start = p.start();
    patch({
      name: `${p.name} ${start.getFullYear()}`,
      bannerText: p.banner,
      kind: "percent",
      value: p.percentOff,
      duration: p.once ? "once" : "repeating",
      months: p.months || "1",
      startsAt: dayInput(start),
      endsAt: dayInput(new Date(start.getTime() + p.days * 86400000)),
    });
  }

  async function create() {
    setSaving(true);
    try {
      await adminApi.createSale({
        name: f.name,
        bannerText: f.bannerText,
        plans: f.plans,
        ...discountBody(f),
        startsAt: new Date(`${f.startsAt}T00:00:00`).toISOString(),
        endsAt: new Date(`${f.endsAt}T23:59:59`).toISOString(),
      });
      toast.success("Sale created");
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the sale");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New sale</DialogTitle>
          <DialogDescription>Applied automatically at checkout between the dates. Customers keep the discount for its full length.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.name} type="button" onClick={() => preset(p)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium hover:bg-violet-100 hover:text-violet-700">
              {p.banner.split(" ")[0]} {p.name}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input value={f.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Christmas 2026" />
          </div>
          <DiscountFields f={f} setF={patch} />
          <PlanPicker value={f.plans} onChange={(plans) => patch({ plans })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Starts</Label>
              <Input type="date" value={f.startsAt} onChange={(e) => patch({ startsAt: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Ends</Label>
              <Input type="date" value={f.endsAt} onChange={(e) => patch({ endsAt: e.target.value })} />
            </div>
          </div>
          <div>
            <Label className="text-xs">Banner on the pricing page</Label>
            <Input value={f.bannerText} maxLength={160} onChange={(e) => patch({ bannerText: e.target.value })} placeholder="🎄 Christmas sale: 30% off for 3 months" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={create} disabled={saving || !f.name.trim() || !f.value}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Create sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CodeDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: () => void }) {
  const empty = () => ({ code: "", kind: "percent" as "percent" | "amount", value: "", duration: "once" as "once" | "repeating" | "forever", months: "3", plans: [] as string[], maxRedemptions: "", expiresAt: "" });
  const [f, setF] = useState(empty);
  const [saving, setSaving] = useState(false);
  const patch = (p: Partial<ReturnType<typeof empty>>) => setF((x) => ({ ...x, ...p }));

  useEffect(() => { if (open) setF(empty()); }, [open]);

  async function create() {
    setSaving(true);
    try {
      await adminApi.createPromoCode({
        code: f.code,
        plans: f.plans,
        ...discountBody(f),
        maxRedemptions: f.maxRedemptions ? Number(f.maxRedemptions) : null,
        expiresAt: f.expiresAt ? new Date(`${f.expiresAt}T23:59:59`).toISOString() : null,
      });
      toast.success(`${f.code.toUpperCase()} is ready to use`);
      onOpenChange(false);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't create the code");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New promo code</DialogTitle>
          <DialogDescription>Customers type it at checkout.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Code</Label>
            <Input value={f.code} onChange={(e) => patch({ code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") })} placeholder="DIWALI30" maxLength={30} className="font-mono" />
          </div>
          <DiscountFields f={f} setF={patch} />
          <PlanPicker value={f.plans} onChange={(plans) => patch({ plans })} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Max uses (optional)</Label>
              <Input type="number" min={1} value={f.maxRedemptions} onChange={(e) => patch({ maxRedemptions: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Expires (optional)</Label>
              <Input type="date" value={f.expiresAt} onChange={(e) => patch({ expiresAt: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={create} disabled={saving || f.code.length < 3 || !f.value}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
