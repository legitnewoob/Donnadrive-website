import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Lock, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { plans } from "../components/Pricing/plans";

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planSlug = searchParams.get("plan") || "adi";
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    name: "",
  });

  const selectedPlan = plans.find(p => p.slug === planSlug);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Integrate with Stripe or other payment processor
    // For now, simulate payment processing
    setTimeout(() => {
      setLoading(false);
      // Redirect to dashboard after successful payment
      navigate("/dashboard");
    }, 2000);
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Plan not found</p>
            <Button className="mt-4" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border">
                <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center">
                  <selectedPlan.icon className="h-6 w-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{selectedPlan.title} Plan</h3>
                  <p className="text-sm text-muted-foreground">{selectedPlan.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">{selectedPlan.price}</p>
                  <p className="text-sm text-muted-foreground">{selectedPlan.period}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">Included Features</h4>
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">£0.00</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{selectedPlan.price}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Complete your secure payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Cardholder Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    Your payment information is encrypted and secure
                  </span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Pay ${selectedPlan.price}`
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By completing this purchase, you agree to our Terms of Service
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;
