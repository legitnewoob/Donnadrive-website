import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Star, ArrowRight, CalendarClock, X } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
import { adminApi, gbp, PLAN_LABELS, type AdminPlan, type PriceChange } from "@/lib/adminApi";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const toPence = (pounds: string) => Math.round(parseFloat(pounds) * 100);
const toPounds = (pence: number) => (pence / 100).toFixed(pence % 100 ? 2 : 0);

export default function AdminPricing() {
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [noticeDays, setNoticeDays] = useState(30);
  const [changes, setChanges] = useState<PriceChange[]>([]);

  const load = () => {
    adminApi.plans().then((r) => { setPlans(r.data); setNoticeDays(r.noticeDays); }).catch((e) => toast.error(e.message));
    adminApi.priceChanges().then(setChanges).catch(() => {});
  };
  useEffect(load, []);

  async function cancelChange(id: string) {
    try {
      await adminApi.cancelPriceChange(id);
      toast.success("Cancelled. Existing subscribers stay on their current price.");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't cancel");
    }
  }

  return (
    <AdminLayout title="Pricing" subtitle="What the website shows and what checkout charges" permission="admin.pricing">
      {!plans ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {plans.map((p) => <PlanEditor key={p.slug} plan={p} noticeDays={noticeDays} onSaved={load} />)}
          </div>

          <section className="rounded-xl border bg-white">
            <div className="border-b px-4 py-3">
              <h2 className="font-semibold">Price changes</h2>
              <p className="text-xs text-muted-foreground">
                New sign-ups pay a new price straight away. Existing subscribers move at their renewal: rises after {noticeDays} days' notice (they're emailed), cuts straight away.
              </p>
            </div>
            {changes.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">No price changes yet.</p>
            ) : (
              <ul className="divide-y">
                {changes.map((c) => (
                  <li key={c._id} className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 font-medium">
                        {PLAN_LABELS[c.plan]} {c.kind === "seat" ? "extra seat" : ""}
                        <span className="text-muted-foreground">{gbp(c.fromAmount)}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                        <span className={c.toAmount > c.fromAmount ? "text-amber-700" : "text-green-700"}>{gbp(c.toAmount)}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.status === "scheduled" && <>Subscribers move on {date(c.effectiveAt)} · {c.notified} emailed</>}
                        {c.status === "applied" && <>Applied {date(c.effectiveAt)} · {c.migrated} moved{c.failed ? `, ${c.failed} failed (check logs)` : ""}</>}
                        {c.status === "cancelled" && <>Cancelled · existing subscribers weren't moved</>}
                        {c.by && <> · by {c.by}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${
                          c.status === "scheduled" ? "bg-amber-100 text-amber-800" : c.status === "applied" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.status === "scheduled" && (
                        <Button size="sm" variant="ghost" onClick={() => cancelChange(c._id)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Don't move subscribers
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </AdminLayout>
  );
}

function PlanEditor({ plan, noticeDays, onSaved }: { plan: AdminPlan; noticeDays: number; onSaved: () => void }) {
  const isSchool = plan.slug === "driving-school";
  // £0 = a free plan (no checkout). Driving schools are always paid: seats are billed on the plan.
  const initial = () => ({
    name: plan.name,
    subtitle: plan.subtitle,
    button: plan.button,
    features: plan.features.join("\n"),
    popular: plan.popular,
    trialDays: String(plan.trialDays),
    price: toPounds(plan.amount),
    includedSeats: String(plan.includedSeats || 0),
    seatPrice: toPounds(plan.extraSeatAmount || 0),
  });
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => setF(initial()), [plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceNow = toPence(f.price || "0");
  const freeNow = !isSchool && priceNow === 0;
  const set = (k: keyof ReturnType<typeof initial>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function diff() {
    const out: Partial<AdminPlan> = {};
    if (f.name !== plan.name) out.name = f.name;
    if (f.subtitle !== plan.subtitle) out.subtitle = f.subtitle;
    if (f.button !== plan.button) out.button = f.button;
    const features = f.features.split("\n").map((x) => x.trim()).filter(Boolean);
    if (features.join("\n") !== plan.features.join("\n")) out.features = features;
    if (f.popular !== plan.popular) out.popular = f.popular;
    if (!freeNow && Number(f.trialDays) !== plan.trialDays) out.trialDays = Number(f.trialDays);
    if (!Number.isNaN(priceNow) && priceNow !== plan.amount) out.amount = priceNow;
    if (isSchool && Number(f.includedSeats) !== plan.includedSeats) out.includedSeats = Number(f.includedSeats);
    if (isSchool && toPence(f.seatPrice) !== plan.extraSeatAmount) out.extraSeatAmount = toPence(f.seatPrice);
    return out;
  }

  const changes = diff();
  const dirty = Object.keys(changes).length > 0;
  const priceChanging = changes.amount !== undefined || changes.extraSeatAmount !== undefined;

  async function save() {
    setSaving(true);
    try {
      const { priceChanges } = await adminApi.updatePlan(plan.slug, changes);
      toast.success(
        priceChanges.length
          ? priceChanges.some((c) => c.status === "scheduled")
            ? "Saved. New sign-ups pay the new price now; subscribers have been emailed."
            : "Saved. Subscribers move to the new price at their next renewal."
          : "Saved"
      );
      setConfirm(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  const rise = (changes.amount !== undefined && changes.amount > plan.amount) || (changes.extraSeatAmount !== undefined && changes.extraSeatAmount > plan.extraSeatAmount);
  const effective = new Date(Date.now() + noticeDays * 86400000);

  return (
    <section className={`flex flex-col rounded-xl border bg-white ${plan.popular ? "ring-2 ring-violet-500" : ""}`}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="font-semibold">{PLAN_LABELS[plan.slug]}</h2>
          <p className="text-xs text-muted-foreground">{plan.amount === 0 ? "Free" : `${gbp(plan.amount)}/${plan.interval}${plan.trialDays > 0 ? ` · ${plan.trialDays}-day trial` : " · no trial"}`}{isSchool ? ` · ${plan.includedSeats} seats + ${gbp(plan.extraSeatAmount)} each` : ""}</p>
        </div>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className={`h-3.5 w-3.5 ${f.popular ? "fill-violet-500 text-violet-500" : ""}`} /> Popular
          <Switch checked={f.popular} onCheckedChange={(v) => setF({ ...f, popular: v })} />
        </label>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Price (£/{plan.interval})</Label>
            <Input type="number" min={isSchool ? 1 : 0} step="0.01" value={f.price} onChange={set("price")} />
          </div>
          <div>
            <Label className="text-xs">Free trial (days)</Label>
            <Input type="number" min={0} max={90} value={freeNow ? "" : f.trialDays} placeholder={freeNow ? "—" : undefined} disabled={freeNow} onChange={set("trialDays")} />
          </div>
          <p className="col-span-2 text-xs text-muted-foreground">
            {freeNow
              ? "£0 makes this plan free: people pick it without paying."
              : Number(f.trialDays) > 0
                ? `Checkout with a ${f.trialDays}-day free trial, then ${gbp(priceNow || 0)}/${plan.interval}.`
                : `No trial: people pay ${gbp(priceNow || 0)} at checkout.`}
            {!isSchool && !freeNow && " Set £0 to make it free."}
          </p>
        </div>
        {isSchool && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Seats included</Label>
              <Input type="number" min={1} max={50} value={f.includedSeats} onChange={set("includedSeats")} />
            </div>
            <div>
              <Label className="text-xs">Extra seat (£/{plan.interval})</Label>
              <Input type="number" min={1} step="0.01" value={f.seatPrice} onChange={set("seatPrice")} />
            </div>
          </div>
        )}
        <div>
          <Label className="text-xs">Name</Label>
          <Input value={f.name} onChange={set("name")} />
        </div>
        <div>
          <Label className="text-xs">Subtitle</Label>
          <Input value={f.subtitle} onChange={set("subtitle")} />
        </div>
        <div>
          <Label className="text-xs">Button</Label>
          <Input value={f.button} onChange={set("button")} />
        </div>
        <div>
          <Label className="text-xs">Features (one per line)</Label>
          <Textarea rows={5} value={f.features} onChange={set("features")} />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t px-4 py-3">
        <Button size="sm" variant="ghost" disabled={!dirty || saving} onClick={() => setF(initial())}>Reset</Button>
        <Button size="sm" disabled={!dirty || saving} onClick={() => (priceChanging ? setConfirm(true) : save())}>
          {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Save
        </Button>
      </div>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change the {PLAN_LABELS[plan.slug]} price?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                {changes.amount !== undefined && (
                  <p>
                    Plan: <strong>{plan.amount === 0 ? "Free" : gbp(plan.amount)} → {changes.amount === 0 ? "Free" : gbp(changes.amount)}</strong>
                    {changes.amount > 0 && ` a ${plan.interval}`}.
                  </p>
                )}
                {changes.amount !== undefined && plan.amount === 0 && changes.amount > 0 && (
                  <p className="rounded-lg bg-sky-50 p-2 text-sky-900">
                    New sign-ups on this plan go through checkout
                    {(changes.trialDays ?? plan.trialDays) > 0 ? ` with a ${changes.trialDays ?? plan.trialDays}-day free trial` : " and pay straight away"}.
                    Anyone already on it for free keeps it free (marked as comped in Customers; remove the comp to make them pay).
                  </p>
                )}
                {changes.amount === 0 && (
                  <p className="rounded-lg bg-sky-50 p-2 text-sky-900">The plan becomes free: people pick it without checkout. This only works if nobody is paying for it.</p>
                )}
                {changes.extraSeatAmount !== undefined && <p>Extra seat: <strong>{gbp(plan.extraSeatAmount)} → {gbp(changes.extraSeatAmount)}</strong> a {plan.interval}.</p>}
                <p>New sign-ups pay the new price straight away, and the website updates within a minute.</p>
                {plan.amount === 0 || changes.amount === 0 ? null : rise ? (
                  <p className="flex gap-2 rounded-lg bg-amber-50 p-2 text-amber-900">
                    <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
                    Existing subscribers are emailed now and move to the new price from their first renewal after {date(effective.toISOString())}.
                  </p>
                ) : (
                  <p className="rounded-lg bg-green-50 p-2 text-green-900">It's a cut, so existing subscribers move now and pay less from their next renewal. Nobody is charged today.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); save(); }} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Change price
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
