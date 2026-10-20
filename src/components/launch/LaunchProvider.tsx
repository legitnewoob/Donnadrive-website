import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import SignupDialog from "@/components/SignupDialog";
import WaitlistDialog from "./WaitlistDialog";
import { captureAttribution, type WaitlistBlock } from "@/lib/launch";

export type WaitlistType = "adi" | "pdi" | "school";

export interface WaitlistOptions {
  /** Preselected "I am" answer (e.g. from a Pricing card) */
  type?: WaitlistType;
  /** The sign-up gate said no: their Google name and email, and whether they're already on the list */
  block?: WaitlistBlock;
}

interface LaunchActions {
  openWaitlist: (opts?: WaitlistOptions) => void;
  /** Google sign-in (and, when sign-up is open, sign-up) */
  openSignIn: () => void;
}

const LaunchContext = createContext<LaunchActions | null>(null);

/**
 * One waitlist dialog and one sign-in dialog for the whole site, so any button
 * anywhere can open them. Also remembers ?ref= and UTM tags from the landing page.
 */
export function LaunchProvider({ children }: { children: ReactNode }) {
  const [waitlist, setWaitlist] = useState<WaitlistOptions | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  const openWaitlist = useCallback((opts: WaitlistOptions = {}) => {
    setSignInOpen(false);
    setWaitlist(opts);
  }, []);
  const openSignIn = useCallback(() => {
    setWaitlist(null);
    setSignInOpen(true);
  }, []);

  const value = useMemo(() => ({ openWaitlist, openSignIn }), [openWaitlist, openSignIn]);

  return (
    <LaunchContext.Provider value={value}>
      {children}
      <WaitlistDialog options={waitlist} onClose={() => setWaitlist(null)} />
      <SignupDialog open={signInOpen} onOpenChange={setSignInOpen} onWaitlist={(block) => openWaitlist({ block })} />
    </LaunchContext.Provider>
  );
}

export function useLaunchActions(): LaunchActions {
  const ctx = useContext(LaunchContext);
  if (!ctx) throw new Error("useLaunchActions must be used inside <LaunchProvider>");
  return ctx;
}
