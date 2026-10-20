import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { launchDay, useLaunch } from "@/lib/launch";
import { useLaunchActions } from "./LaunchProvider";

const DISMISS_KEY = "dd_banner_closed";

function countdown(date: string, now: number) {
  // Launch is the start of that day, UK time (near enough for a countdown)
  const ms = new Date(`${date}T00:00:00`).getTime() - now;
  if (ms <= 0) return null;
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} to go`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `${hours} hour${hours === 1 ? "" : "s"} to go`;
}

/**
 * A slim strip above the header: "Launching Mon 3 Nov · 12 days to go · Join the
 * waitlist". Only while a launch date is set and sign-up is closed; closable for
 * the session.
 */
export default function LaunchBanner() {
  const launch = useLaunch();
  const { openWaitlist } = useLaunchActions();
  const [now, setNow] = useState(() => Date.now());
  const [closed, setClosed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (closed || !launch.date || launch.mode === "open") return null;
  const left = countdown(launch.date, now);

  function close() {
    setClosed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* private mode */
    }
  }

  return (
    <div className="relative bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-x-2 px-10 py-2 text-center text-xs sm:text-sm">
        <button type="button" onClick={() => openWaitlist()} className="min-w-0 truncate hover:underline">
          {launch.message ? (
            <span>{launch.message}</span>
          ) : (
            <span>
              <strong>Launching {launchDay(launch.date)}</strong>
              {left && <span className="text-white/70"> · {left}</span>}
            </span>
          )}
          <span className="ml-2 font-semibold text-[#FFB4A3]">Join the waitlist →</span>
        </button>
        <button type="button" onClick={close} aria-label="Close" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-white/60 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
