import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { homePath } from "@/lib/access";
import { isClosed, useLaunch } from "@/lib/launch";
import { useLaunchActions, type WaitlistType } from "./LaunchProvider";

interface Props extends Omit<ButtonProps, "onClick" | "children" | "type"> {
  /** Label when sign-up is open (default "Get started") */
  openLabel?: ReactNode;
  /** Label while the waitlist is on (default "Join the waitlist") */
  closedLabel?: ReactNode;
  /** Preselect "I am…" on the waitlist form */
  audience?: WaitlistType;
}

const signedIn = () => {
  try {
    return !!localStorage.getItem("dd_token");
  } catch {
    return false;
  }
};

/**
 * The site's main call to action. Follows the launch mode: "Join the waitlist"
 * while sign-up is closed, "Get started" once it's open. Signed-in visitors get
 * a way back to their dashboard instead.
 */
export default function PrimaryCTA({ openLabel = "Get started", closedLabel = "Join the waitlist", audience, ...button }: Props) {
  const launch = useLaunch();
  const { openWaitlist, openSignIn } = useLaunchActions();
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(signedIn);

  useEffect(() => {
    const check = () => setIsSignedIn(signedIn());
    window.addEventListener("dd_auth_change", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("dd_auth_change", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  if (isSignedIn) {
    return (
      <Button {...button} onClick={() => navigate(homePath())}>
        Open your dashboard
      </Button>
    );
  }

  const closed = isClosed(launch);
  return (
    <Button {...button} onClick={() => (closed ? openWaitlist({ type: audience }) : openSignIn())}>
      {closed ? closedLabel : openLabel}
    </Button>
  );
}
