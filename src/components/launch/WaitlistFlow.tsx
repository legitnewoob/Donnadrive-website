import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WaitlistStatusCard from "./WaitlistStatusCard";
import type { WaitlistOptions } from "./LaunchProvider";
import {
  SHOW_COUNT_FROM,
  forgetWaitlistToken,
  getWaitlistStatus,
  joinWaitlist,
  launchDay,
  myWaitlistToken,
  useLaunch,
  type WaitlistEntry,
  type WaitlistStatus,
} from "@/lib/launch";

type View =
  | { kind: "loading" }
  | { kind: "form" }
  | { kind: "status"; entry: WaitlistEntry | WaitlistStatus; celebrate: boolean }
  | { kind: "already"; name: string; place: number | null; invited: boolean; fromForm: boolean };

interface Props extends WaitlistOptions {
  onSignIn?: () => void;
}

/**
 * Join the waitlist in one step (name and email), then straight to their place,
 * a link to share and a few optional questions. Someone already on the list
 * (this browser remembers them) sees their place instead of the form.
 */
export default function WaitlistFlow({ type, block, onSignIn }: Props) {
  const launch = useLaunch();
  const [view, setView] = useState<View>(() => {
    if (block?.onList) return { kind: "already", name: block.name, place: block.place, invited: block.status === "invited", fromForm: false };
    return myWaitlistToken() ? { kind: "loading" } : { kind: "form" };
  });
  const [name, setName] = useState(block?.name || "");
  const [email, setEmail] = useState(block?.email || "");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; hasAccount?: boolean } | null>(null);

  // A returning visitor: show their place, not the form
  useEffect(() => {
    const token = myWaitlistToken();
    if (!token || block) return;
    let live = true;
    getWaitlistStatus(token)
      .then((s) => live && setView({ kind: "status", entry: { ...s, token }, celebrate: false }))
      .catch(() => {
        forgetWaitlistToken();
        if (live) setView({ kind: "form" });
      });
    return () => {
      live = false;
    };
  }, [block]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError({ message: "Please tell us your name" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError({ message: "Please enter a valid email address" });
    setSubmitting(true);
    try {
      const result = await joinWaitlist({ name: name.trim(), email: email.trim(), type: type ?? null, website: honeypot });
      if (result.created) setView({ kind: "status", entry: result.entry, celebrate: true });
      else setView({ kind: "already", name: result.entry.name, place: result.entry.place, invited: result.entry.status === "invited", fromForm: true });
    } catch (err) {
      const e2 = err as Error & { code?: string };
      setError({ message: e2.message, hasAccount: e2.code === "HAS_ACCOUNT" });
    } finally {
      setSubmitting(false);
    }
  }

  const showCount = launch.count >= SHOW_COUNT_FROM;
  const notOpen = !!block && !block.onList;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {view.kind === "loading" && (
        <motion.div key="loading" className="flex justify-center py-16" exit={{ opacity: 0 }}>
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </motion.div>
      )}

      {view.kind === "form" && (
        <motion.form
          key="form"
          onSubmit={submit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-5"
          noValidate
        >
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {notOpen ? "We're not open yet" : "Join the waitlist"}
            </h2>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground sm:text-base">
              {notOpen
                ? "Donna Drive is invite-only for now. Join the waitlist and we'll email you as soon as it's your turn."
                : launch.date
                  ? `We launch ${launchDay(launch.date)}. Join now to be one of the first instructors in.`
                  : "Be one of the first instructors to get Donna. We're letting people in in small batches."}
            </p>
          </div>

          {showCount && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className="flex -space-x-2">
                {["bg-sky-400", "bg-primary", "bg-amber-400", "bg-emerald-400"].map((c, i) => (
                  <span key={c} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${c} text-[10px] font-bold text-white`}>
                    {["J", "S", "A", "M"][i]}
                  </span>
                ))}
              </div>
              <span className="text-slate-700">
                <strong>{launch.count.toLocaleString("en-GB")}</strong> instructors waiting
                {launch.joinedToday > 0 && <span className="text-muted-foreground"> · {launch.joinedToday} joined today</span>}
              </span>
            </div>
          )}

          <div className="space-y-3">
            <Input
              aria-label="Your name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="h-12 rounded-xl text-base"
              autoFocus={!name}
            />
            <Input
              aria-label="Email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="h-12 rounded-xl text-base"
            />
            {/* Only bots fill this in */}
            <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute left-[-9999px] h-0 w-0 opacity-0" />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error.message}
              {error.hasAccount && onSignIn && (
                <>
                  {" "}
                  <button type="button" onClick={onSignIn} className="font-semibold underline">Sign in</button>
                </>
              )}
            </p>
          )}

          <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base font-semibold" disabled={submitting}>
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Join the waitlist"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            No spam. Just your place in the queue and your invite.
            {onSignIn && (
              <>
                <br />
                Already have an account?{" "}
                <button type="button" onClick={onSignIn} className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900">
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.form>
      )}

      {view.kind === "status" && (
        <motion.div key="status" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
          <WaitlistStatusCard entry={view.entry} launch={launch} celebrate={view.celebrate} />
          {!view.celebrate && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Not you?{" "}
              <button
                type="button"
                className="underline"
                onClick={() => {
                  forgetWaitlistToken();
                  setName("");
                  setEmail("");
                  setView({ kind: "form" });
                }}
              >
                Join with another email
              </button>
            </p>
          )}
        </motion.div>
      )}

      {view.kind === "already" && (
        <motion.div key="already" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {view.invited ? "Your invite is waiting" : "You're already on the list"}
            {!view.invited && view.place ? <span className="block text-5xl">#{view.place.toLocaleString("en-GB")}</span> : null}
          </h2>
          <p className="mx-auto max-w-sm text-sm text-muted-foreground">
            {view.invited
              ? "We've emailed you an invite. Open the link in it to sign up. It saves your spot and any launch offer."
              : `We'll email you as soon as it's your turn.${view.fromForm ? " Look out for our email too: it has a link to see your place and share it to move up." : ""}`}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
