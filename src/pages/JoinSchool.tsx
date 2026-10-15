import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Building2, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";
import { googleSignup, getSchoolInvite, acceptSchoolInvite } from "@/lib/api";

type Invite = { schoolName: string; ownerName: string | null; email: string };

/**
 * /join/:token — an instructor invited to a driving school signs in with Google
 * (a free account is created if needed, no checkout) and joins the school.
 */
export default function JoinSchool() {
  const { token: inviteToken = "" } = useParams();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState<{ schoolName: string; hadOwnSubscription: boolean } | null>(null);

  useEffect(() => {
    getSchoolInvite(inviteToken)
      .then(setInvite)
      .catch((e) => setError(e instanceof Error ? e.message : "This invite isn't valid"))
      .finally(() => setLoading(false));
  }, [inviteToken]);

  async function join(authToken: string) {
    setJoining(true);
    setError("");
    try {
      const result = await acceptSchoolInvite(authToken, inviteToken);
      setJoined(result);
      if (!result.hadOwnSubscription) setTimeout(() => navigate("/dashboard"), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't join the school");
    } finally {
      setJoining(false);
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setJoining(true);
      try {
        // Free account (no checkout); joining the school then puts them on its plan
        const result = await googleSignup(tokenResponse.access_token, "pdi");
        localStorage.setItem("dd_token", result.token);
        if (result.apiKey) localStorage.setItem("dd_apiKey", result.apiKey);
        window.dispatchEvent(new Event("dd_auth_change"));
        await join(result.token);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Google sign-in failed");
        setJoining(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled"),
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 py-8 text-center">
          <img src={donnaDriveLogo} alt="Donna Drive" className="mx-auto h-10 w-auto" />

          {loading ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
          ) : joined ? (
            <div className="space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-green-600" />
              <h1 className="text-xl font-bold">You've joined {joined.schoolName}</h1>
              {joined.hadOwnSubscription ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Your school now covers Donna for you. You still have your own subscription, so cancel it from
                    Account → Manage Subscription to avoid paying twice.
                  </p>
                  <Button onClick={() => navigate("/account")}>Go to Account</Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Taking you to set up your Donna…</p>
              )}
            </div>
          ) : !invite ? (
            <div className="space-y-3">
              <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
              <h1 className="text-xl font-bold">This invite can't be used</h1>
              <p className="text-sm text-muted-foreground">{error || "It may have expired or been cancelled. Ask your school for a new one."}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
                <Building2 className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Join {invite.schoolName}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {invite.ownerName ? `${invite.ownerName} has` : "You've been"} invited you to use Donna Drive as one of the
                  school's instructors. Your school covers the cost.
                </p>
              </div>
              <p className="rounded-lg bg-slate-50 p-3 text-sm">
                Sign in with the Google account for <strong>{invite.email}</strong>
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" onClick={() => googleLogin()} disabled={joining}>
                {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continue with Google
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
