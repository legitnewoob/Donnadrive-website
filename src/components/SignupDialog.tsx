import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Calendar, Shield, Clock3, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Plan {
  slug: string;
  title: string;
  subtitle: string;
  price: string;
  period: string;
  features: string[];
  button: string;
  icon: React.ElementType;
}

interface Props {
  plan: Plan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignupDialog({ plan, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState<"signup" | "connect" | "success">("signup");
  const [loading, setLoading] = useState(false);

  const Icon = plan.icon;

  const handleGoogleSignin = async () => {
    setLoading(true);

    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);

    if (plan.slug === "pdi") {
      setStep("connect");
    } else {
      onOpenChange(false);
      navigate(`/payment?plan=${plan.slug}`);
    }
  };

  const handleConnectCalendar = async () => {
    setLoading(true);

    // Simulate Google Calendar OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));

    setLoading(false);
    setStep("success");

    setTimeout(() => {
      onOpenChange(false);
      navigate("/dashboard");
    }, 1000);
  };

  const handleClose = () => {
    setStep("signup");
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            {step === "signup" && "Create your account"}
            {step === "connect" && "Connect your Google Account"}
            {step === "success" && "All set!"}
          </DialogTitle>
          <DialogDescription className="text-base mt-2">
            {step === "signup" && `You're signing up for the ${plan.title} plan.`}
            {step === "connect" && "Donna Drive uses your Google Calendar to manage bookings and avoid double bookings."}
            {step === "success" && "Your account is ready. Redirecting to dashboard..."}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                  <Icon className="h-6 w-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{plan.title} Plan</h3>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">{plan.period}</p>
                </div>
              </div>

              <div className="space-y-3">
                {plan.features.map((feature: string) => (
                  <div key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base rounded-full"
                onClick={handleGoogleSignin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue with Google"
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </motion.div>
          )}

          {step === "connect" && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-4 rounded-xl border p-4">
                <Calendar className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <h3 className="font-semibold">Google Calendar Sync</h3>
                  <p className="text-sm text-muted-foreground">Donna checks your availability before confirming every lesson.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border p-4">
                <Shield className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <h3 className="font-semibold">Secure OAuth</h3>
                  <p className="text-sm text-muted-foreground">You stay in control and can revoke access at any time.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border p-4">
                <Clock3 className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <h3 className="font-semibold">Takes less than 30 seconds</h3>
                  <p className="text-sm text-muted-foreground">One click and you're ready to continue.</p>
                </div>
              </div>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-12 text-base"
                onClick={handleConnectCalendar}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Google Calendar"
                )}
              </Button>
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
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
