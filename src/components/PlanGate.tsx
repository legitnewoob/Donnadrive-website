import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { ArrowLeft, Check, Loader2, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { chooseFreePlan, createCheckoutSession, getProfile } from "@/lib/api";
import { useDisplayPlans, gbp, type DisplayPlan } from "@/lib/pricing";
import { getAccess, isInstructorPage, markPlanChosen, signOut } from "@/lib/access";

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
// Loaded once; without a key, payment falls back to Stripe's own page
const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

type PaidSlug = "adi" | "driving-school";

/**
 * Someone who signed in but hasn't picked a plan sees their dashboard blurred
 * behind this modal until they do. If they picked a paid plan and left at the
 * payment step, it reopens on that payment so they can pick up where they left off.
 */
export default function PlanGate() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [locked, setLocked] = useState(false);
  const [name, setName] = useState("");
  const [paying, setPaying] = useState<PaidSlug | null>(null);
  const [resumed, setResumed] = useState(false);

  const params = new URLSearchParams(search);
  // Back from checkout: the dashboard is finishing sign-in, so stay out of the way. Read
  // the live URL: the dashboard strips auth_code with replaceState, which the router doesn't see.
  const returningFromCheckout = new URLSearchParams(window.location.search).has("auth_code");
  const onInstructorPage = isInstructorPage(pathname, search);

  const refresh = useCallback(() => {
    const token = localStorage.getItem("dd_token");
    const access = getAccess();
    setLocked(!!token && !!access?.needsPlan && !access?.staffRole);
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("dd_auth_change", refresh);
    return () => window.removeEventListener("dd_auth_change", refresh);
  }, [refresh]);

  // Ask the server whenever an instructor page opens (the stored flag may be stale)
  useEffect(() => {
    const token = localStorage.getItem("dd_token");
    if (!token || !onInstructorPage || returningFromCheckout) return;
    getProfile(token)
      .then((p) => {
        setName(p.name?.split(" ")[0] || "");
        if (!p.needsPlan) return;
        // ?plan= from the sign-up dialog, or a payment they didn't finish
        const asked = params.get("plan");
        const resume = (asked === "adi" || asked === "driving-school" ? asked : p.pendingPlan) || null;
        if (resume) {
          setPaying(resume);
          setResumed(!asked);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, onInstructorPage, returningFromCheckout]);

  if (!locked || !onInstructorPage || returningFromCheckout) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 px-3 py-6 backdrop-blur-md sm:items-center sm:py-10">
      <div role="dialog" aria-modal="true" aria-labelledby="plan-gate-title" className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-7 sm:py-4">
          {paying ? (
            <button onClick={() => { setPaying(null); setResumed(false); }} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Change plan
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Lock className="h-3.5 w-3.5" /> One step left
            </span>
          )}
          <button
            onClick={() => { signOut(); navigate("/"); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {paying ? (
          <PayStep plan={paying} resumed={resumed} />
        ) : (
          <ChooseStep name={name} onPaid={(slug) => { setPaying(slug); setResumed(false); }} />
        )}
      </div>
    </div>
  );
}

function ChooseStep({ name, onPaid }: { name: string; onPaid: (slug: PaidSlug) => void }) {
  const { plans } = useDisplayPlans();
  const [busy, setBusy] = useState(false);

  async function pick(plan: DisplayPlan) {
    if (plan.slug !== "pdi") {
      onPaid(plan.slug as PaidSlug);
      return;
    }
    const token = localStorage.getItem("dd_token");
    if (!token) return;
    setBusy(true);
    try {
      await chooseFreePlan(token);
      markPlanChosen();
      // The dashboard loaded while locked; load it again now it's open
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't choose the plan");
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-7 sm:py-8">
      <h2 id="plan-gate-title" className="text-center text-xl font-black sm:text-3xl">
        {name ? `${name}, choose your plan` : "Choose your plan"}
      </h2>
      <p className="mt-1 text-center text-sm text-muted-foreground sm:mt-2">Your dashboard and Portal open as soon as you pick one.</p>

      <div className="mt-4 grid gap-2.5 sm:mt-6 md:grid-cols-3 md:gap-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = plan.sale ? gbp(plan.sale.amount) : plan.price;
          return (
            <div key={plan.slug} className={`flex flex-col rounded-2xl border p-3.5 md:p-5 ${plan.popular ? "border-primary ring-1 ring-primary" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 md:h-10 md:w-10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-bold">
                    {plan.title}
                    {plan.popular && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white">Popular</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{plan.subtitle}</p>
                </div>
                {/* Phones: price beside the name, to keep each plan short */}
                <div className="shrink-0 text-right md:hidden">
                  {plan.sale && <p className="text-xs text-muted-foreground line-through">{plan.price}</p>}
                  <p className="text-xl font-black leading-tight">{price}</p>
                  {plan.period && <p className="text-[11px] text-muted-foreground">{plan.period}</p>}
                </div>
              </div>
              <div className="mt-4 hidden flex-wrap items-end gap-x-1.5 md:flex">
                {plan.sale && <span className="pb-0.5 text-sm font-semibold text-muted-foreground line-through">{plan.price}</span>}
                <span className="text-3xl font-black">{price}</span>
                <span className="pb-1 text-sm text-muted-foreground">{plan.period}</span>
              </div>
              {plan.sale ? (
                <p className="mt-2 text-xs font-semibold text-rose-600 md:mt-1">
                  {plan.sale.label}
                  {plan.trialDays > 0 && <span className="font-normal text-green-700 md:hidden"> · {plan.trialDays}-day free trial</span>}
                </p>
              ) : plan.trialDays > 0 ? (
                <p className="mt-2 text-xs text-green-700 md:mt-1">{plan.trialDays}-day free trial</p>
              ) : null}
              {/* The full feature list is on the pricing page; on phones it made this two screens long */}
              <ul className="mt-4 hidden flex-1 space-y-1.5 text-sm md:block">
                {plan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" /> {f}</li>
                ))}
              </ul>
              <Button className="mt-3 w-full md:mt-5" size="sm" variant={plan.popular ? "default" : "outline"} disabled={busy} onClick={() => pick(plan)}>
                {busy && plan.slug === "pdi" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {plan.slug === "pdi" ? "Continue free" : plan.button}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayStep({ plan, resumed }: { plan: PaidSlug; resumed: boolean }) {
  const { plans } = useDisplayPlans();
  const p = plans.find((x) => x.slug === plan);
  const [redirecting, setRedirecting] = useState(false);
  const token = localStorage.getItem("dd_token") || "";

  // A new Checkout Session each time this step opens (Stripe sessions are single-use)
  const fetchClientSecret = useCallback(async () => {
    const { clientSecret } = await createCheckoutSession(token, plan, { embedded: true });
    if (!clientSecret) throw new Error("Couldn't start checkout");
    return clientSecret;
  }, [token, plan]);
  const options = useMemo(() => ({ fetchClientSecret }), [fetchClientSecret]);

  async function redirect() {
    setRedirecting(true);
    try {
      const { url } = await createCheckoutSession(token, plan);
      if (url) window.location.href = url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't start checkout");
      setRedirecting(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-7 sm:py-6">
      <div className="mb-4 sm:mb-5">
        <h2 id="plan-gate-title" className="text-xl font-black sm:text-2xl">
          {resumed ? `Finish setting up ${p?.title || "your plan"}` : `${p?.title || "Your plan"}`}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {resumed ? "You picked this plan last time but didn't finish paying. Pick up where you left off." : p?.subtitle}
          {p && p.amount != null && (
            <> · <strong>{p.sale ? gbp(p.sale.amount) : p.price}{p.period}</strong>{p.trialDays > 0 && `, ${p.trialDays} days free first`}</>
          )}
        </p>
      </div>

      {stripePromise ? (
        <div className="min-h-[420px] overflow-hidden rounded-2xl border">
          <EmbeddedCheckoutProvider key={plan} stripe={stripePromise} options={options}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      ) : (
        <div className="rounded-2xl border bg-slate-50 p-4 text-center sm:p-6">
          <Lock className="mx-auto h-6 w-6 text-slate-400" />
          <p className="mt-2 text-sm text-muted-foreground">Payment is handled securely by Stripe.</p>
          <Button className="mt-4 h-auto w-full whitespace-normal py-3 sm:w-auto" onClick={redirect} disabled={redirecting}>
            {redirecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue to secure payment
          </Button>
        </div>
      )}
    </div>
  );
}
