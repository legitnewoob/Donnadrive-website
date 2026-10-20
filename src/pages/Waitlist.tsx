import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import WaitlistFlow from "@/components/launch/WaitlistFlow";
import WaitlistStatusCard from "@/components/launch/WaitlistStatusCard";
import { useLaunchActions } from "@/components/launch/LaunchProvider";
import { getWaitlistStatus, myWaitlistToken, rememberWaitlistToken, useLaunch, type WaitlistStatus } from "@/lib/launch";

function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[100dvh] items-start justify-center bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] px-4 pb-12 pt-28 sm:items-center md:pt-32">
        <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-8">{children}</div>
      </main>
    </div>
  );
}

/** /waitlist — the full-page version of the waitlist dialog, for links and ads. */
export default function WaitlistPage() {
  usePageTitle("Join the waitlist · Donna Drive");
  const { openSignIn } = useLaunchActions();
  const [params] = useSearchParams();
  const type = params.get("type");
  return (
    <Shell>
      <WaitlistFlow type={type === "adi" || type === "pdi" || type === "school" ? type : undefined} onSignIn={openSignIn} />
    </Shell>
  );
}

/** /waitlist/me?t=… — their place, from the link in every waitlist email. No password. */
export function WaitlistMe() {
  usePageTitle("Your place · Donna Drive");
  const [params] = useSearchParams();
  const launch = useLaunch();
  const token = params.get("t") || myWaitlistToken();
  const [status, setStatus] = useState<WaitlistStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getWaitlistStatus(token)
      .then((s) => {
        rememberWaitlistToken(token);
        setStatus({ ...s, token });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "We couldn't find your place"));
  }, [token]);

  if (!token) return <Navigate to="/waitlist" replace />;

  return (
    <Shell>
      {error ? (
        <div className="space-y-4 py-4 text-center">
          <h1 className="text-xl font-bold">We couldn't find your place</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild className="rounded-xl">
            <Link to="/waitlist">Join the waitlist</Link>
          </Button>
        </div>
      ) : !status ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
        </div>
      ) : (
        <WaitlistStatusCard entry={status} launch={status.launch || launch} />
      )}
    </Shell>
  );
}
