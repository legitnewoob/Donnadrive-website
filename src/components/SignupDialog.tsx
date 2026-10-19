import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { googleSignup, chooseFreePlan, getProfile } from "@/lib/api";
import { useDisplayPlans, gbp, type DisplayPlan } from "@/lib/pricing";
import { homePath, isSuperAdmin, setAccess, markPlanChosen } from "@/lib/access";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupDialog({ open, onOpenChange }: Props) {
  const [step, setStep] = useState<"signin" | "plan" | "success" | "error">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isReturning, setIsReturning] = useState(false);
  const [userName, setUserName] = useState("");
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { plans, trialDays } = useDisplayPlans();

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const existingToken = localStorage.getItem("dd_token");
      if (existingToken) {
        getProfile(existingToken)
          .then((profile) => {
            setUserName(profile.name.split(" ")[0]);
            setIsReturning(true);
            window.dispatchEvent(new Event("dd_auth_change"));
            // Signed in earlier but closed the plan picker: pick one now
            if (profile.needsPlan) {
              setAuthToken(existingToken);
              setStep("plan");
              onOpenChange(true);
              return;
            }
            setStep("success");
            setTimeout(() => navigate(homePath()), 1200);
          })
          .catch(() => {
            localStorage.removeItem("dd_token");
            localStorage.removeItem("dd_access");
            localStorage.removeItem("dd_apiKey");
            onOpenChange(true);
          });
        return;
      }
    }
    if (!nextOpen) {
      handleClose();
      return;
    }
    onOpenChange(nextOpen);
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");

      try {
        const result = await googleSignup(tokenResponse.access_token, "pdi");

        localStorage.setItem("dd_token", result.token);
        if (result.apiKey) localStorage.setItem("dd_apiKey", result.apiKey);
        setAccess({ staffRole: null, superAdmin: false, ...result.access, needsPlan: !!result.needsPlan, school: result.school ?? null });
        setAuthToken(result.token);
        window.dispatchEvent(new Event("dd_auth_change"));

        // Super admins aren't customers: straight to the admin panel, no plan to pick
        if (result.access?.superAdmin) {
          setUserName(result.instructor.name.split(" ")[0]);
          setIsReturning(!result.isNew);
          setStep("success");
          setTimeout(() => navigate("/admin"), 1200);
          return;
        }

        setUserName(result.instructor.name.split(" ")[0]);
        if (!result.isNew) setIsReturning(true);

        // Anyone who hasn't picked a plan picks one now; everyone else goes in
        if (result.needsPlan) {
          setStep("plan");
        } else {
          setStep("success");
          setTimeout(() => navigate(homePath()), 1500);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStep("error");
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      setError("Google sign-in was cancelled or failed. Please try again.");
      setStep("error");
    },
  });

  async function handlePickPlan(plan: DisplayPlan) {
    const token = authToken || localStorage.getItem("dd_token");
    if (!token) return;

    if (plan.slug === "pdi") {
      setLoading(true);
      try {
        await chooseFreePlan(token);
        markPlanChosen();
        setStep("success");
        setTimeout(() => navigate("/dashboard"), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't choose the plan.");
        setStep("error");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Paid plans: always pay in the modal over the dashboard (it stays locked until they do)
    handleClose();
    navigate(`/dashboard?plan=${plan.slug}`);
  }

  const handleClose = () => {
    setStep("signin");
    setLoading(false);
    setError("");
    setIsReturning(false);
    setUserName("");
    setAuthToken(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl gap-3 overflow-y-auto rounded-3xl p-5 sm:gap-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="pr-6 text-2xl sm:pr-0 sm:text-3xl">
            {step === "signin" && "Get started"}
            {step === "plan" && `Welcome${userName ? `, ${userName}` : ""}! Choose your plan`}
            {step === "success" && (isReturning ? `Welcome back${userName ? `, ${userName}` : ""}!` : "All set!")}
            {step === "error" && "Something went wrong"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm sm:mt-2 sm:text-base">
            {step === "signin" && "Sign in with Google to continue."}
            {step === "plan" && "Paid plans start with a free trial. No contracts, cancel anytime."}
            {step === "success" && (isReturning
              ? `Redirecting to ${isSuperAdmin() ? "the admin panel" : "your dashboard"}...`
              : `Your account is ready. Redirecting to ${isSuperAdmin() ? "the admin panel" : "your dashboard"}...`
            )}
            {step === "error" && "We couldn't complete your sign-in."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "signin" && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="text-center sm:py-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm mb-3 sm:mb-6">
                  We use Google to verify your identity. You'll choose a plan next.
                </p>
                {trialDays > 0 && (
                  <p className="text-center text-xs font-semibold text-green-700">
                    🎉 Paid plans start with a {trialDays}-day free trial. Cancel anytime.
                  </p>
                )}
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-11 sm:h-12 text-base rounded-full"
                onClick={() => googleLogin()}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  "Continue with Google"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          )}

          {step === "plan" && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2.5 sm:space-y-3 sm:mt-2"
            >
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    key={plan.slug}
                    onClick={() => handlePickPlan(plan)}
                    disabled={loading}
                    className={`flex items-center gap-3 p-3.5 sm:gap-4 sm:p-5 rounded-2xl border-2 text-left transition-all hover:border-sky-400 hover:bg-sky-50/50 w-full sm:min-h-[88px] ${
                      plan.popular
                        ? "border-sky-500 bg-sky-50/30"
                        : "border-slate-200"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{plan.title}</h3>
                        {plan.popular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {plan.subtitle}
                      </p>
                      {plan.trialDays > 0 && (
                        <p className="mt-1 text-xs font-semibold text-green-700">
                          {plan.trialDays}-day free trial<span className="hidden sm:inline"> · cancel anytime</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      {plan.sale && (
                        <p className="text-xs text-muted-foreground line-through">{plan.price}</p>
                      )}
                      <p className="text-xl sm:text-2xl font-black text-slate-900">
                        {plan.sale ? gbp(plan.sale.amount) : plan.price}
                      </p>
                      {plan.period && (
                        <p className="text-xs text-muted-foreground">
                          {plan.period}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
              {loading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-sky-600 mr-2" />
                  <span className="text-sm text-muted-foreground">Setting up checkout...</span>
                </div>
              )}
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 sm:py-8"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">Redirecting to {isSuperAdmin() ? "the admin panel" : "your dashboard"}...</p>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-2 sm:py-6 space-y-4"
            >
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                onClick={() => { setStep("signin"); setError(""); }}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
