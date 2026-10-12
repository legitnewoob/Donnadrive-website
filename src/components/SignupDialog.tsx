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
import { googleSignup, createCheckoutSession, getProfile } from "@/lib/api";
import { plans } from "@/components/Pricing/plans";

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

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      const existingToken = localStorage.getItem("dd_token");
      if (existingToken) {
        getProfile(existingToken)
          .then((profile) => {
            setUserName(profile.name.split(" ")[0]);
            setIsReturning(true);
            setStep("success");
            window.dispatchEvent(new Event("dd_auth_change"));
            setTimeout(() => navigate("/get-onboard"), 1200);
          })
          .catch(() => {
            localStorage.removeItem("dd_token");
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
        setAuthToken(result.token);
        window.dispatchEvent(new Event("dd_auth_change"));

        const hasActiveSub = ["active", "trialing"].includes(result.instructor.subscriptionStatus ?? "");

        if (!result.isNew) {
          setIsReturning(true);
          setUserName(result.instructor.name.split(" ")[0]);
        }

        if (!result.isNew && hasActiveSub) {
          setStep("success");
          setTimeout(() => navigate("/get-onboard"), 1500);
        } else if (hasActiveSub) {
          setStep("success");
          setTimeout(() => navigate("/get-onboard"), 1500);
        } else {
          setUserName(result.instructor.name.split(" ")[0]);
          setStep("plan");
        }
      } catch (err) {
        console.error("Signup error:", err);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStep("error");
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google login error:", err);
      setError("Google sign-in was cancelled or failed. Please try again.");
      setStep("error");
    },
  });

  async function handlePickPlan(plan: typeof plans[number]) {
    const token = authToken || localStorage.getItem("dd_token");
    if (!token) return;

    if (plan.slug === "pdi") {
      setStep("success");
      setTimeout(() => navigate("/get-onboard"), 1500);
      return;
    }

    setLoading(true);
    try {
      const checkout = await createCheckoutSession(token, plan.slug);
      window.location.href = checkout.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
      setStep("error");
    } finally {
      setLoading(false);
    }
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
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {step === "signin" && "Get started"}
            {step === "plan" && `Welcome${userName ? `, ${userName}` : ""}! Choose your plan`}
            {step === "success" && (isReturning ? `Welcome back${userName ? `, ${userName}` : ""}!` : "All set!")}
            {step === "error" && "Something went wrong"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step === "signin" && "Sign in with Google to continue."}
            {step === "plan" && "Start free. Upgrade when you're ready. No contracts."}
            {step === "success" && (isReturning
              ? "Redirecting to your dashboard..."
              : "Your account is ready. Redirecting to your dashboard..."
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
              className="space-y-6"
            >
              <div className="text-center py-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <p className="text-muted-foreground text-sm mb-6">
                  We use Google to verify your identity. You'll choose a plan next.
                </p>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base rounded-full"
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
              className="space-y-3 mt-2"
            >
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <button
                    key={plan.slug}
                    onClick={() => handlePickPlan(plan)}
                    disabled={loading}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:border-sky-400 hover:bg-sky-50/50 w-full min-h-[88px] ${
                      plan.popular
                        ? "border-sky-500 bg-sky-50/30"
                        : "border-slate-200"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
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
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {plan.subtitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-slate-900">
                        {plan.price}
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
              className="text-center py-8"
            >
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </motion.div>
          )}

          {step === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
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
