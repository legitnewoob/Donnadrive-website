import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Gift, Loader2, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import Confetti from "@/components/launch/Confetti";
import { useLaunchActions } from "@/components/launch/LaunchProvider";
import { setPendingInvite } from "@/lib/api";
import { getInviteInfo, type InviteInfo } from "@/lib/launch";

const longDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

/**
 * /join?invite=… — the link in a waitlist invite. Welcomes them by name, shows
 * their launch offer, and signs them up with Google (the invite goes with it).
 */
export default function InviteLanding() {
  const [params] = useSearchParams();
  const token = params.get("invite") || "";
  const { openSignIn, openWaitlist } = useLaunchActions();
  const [info, setInfo] = useState<InviteInfo | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "You're in · Donna Drive";
    if (!token) setInfo({ valid: false });
    else
      getInviteInfo(token)
        .then((i) => {
          setInfo(i);
          if (i.valid) setPendingInvite(token);
        })
        .catch(() => setInfo({ valid: false }));
    return () => {
      document.title = previous;
    };
  }, [token]);

  const first = (info?.name || "").split(" ")[0];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[100dvh] items-start justify-center bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] px-4 pb-12 pt-28 sm:items-center md:pt-32">
        <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8">
          {!info ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            </div>
          ) : info.valid ? (
            <>
              <Confetti />
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">You're in{first ? `, ${first}` : ""} 🎉</h1>
              <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
                Your spot on Donna Drive is ready. Sign in with Google, pick your plan and Donna will be answering your learners on WhatsApp in minutes.
              </p>
              {info.promo && (
                <div className="mx-auto mt-5 flex max-w-sm items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-3 text-left">
                  <Gift className="h-6 w-6 shrink-0 text-green-700" />
                  <p className="text-sm text-green-900">
                    <strong>{info.promo.label}</strong> is saved for you. It's applied automatically at checkout.
                  </p>
                </div>
              )}
              <Button size="lg" className="mt-6 h-12 w-full rounded-xl text-base font-semibold" onClick={openSignIn}>
                Continue with Google
              </Button>
              <p className="mt-3 text-xs text-muted-foreground">
                Any Google account works{info.email ? `, it doesn't have to be ${info.email}` : ""}.
                {info.expiresAt && <> This invite works until {longDate(info.expiresAt)}.</>}
              </p>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <h1 className="text-2xl font-bold text-slate-900">This invite has expired or been used</h1>
              <p className="text-sm text-muted-foreground">
                If you've already signed up, just sign in. Otherwise reply to your invite email and we'll send you a new one.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button className="rounded-xl" onClick={openSignIn}>Sign in</Button>
                <Button variant="outline" className="rounded-xl" onClick={() => openWaitlist()}>Join the waitlist</Button>
              </div>
              <p className="text-xs text-muted-foreground"><Link to="/" className="underline">Back to home</Link></p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
