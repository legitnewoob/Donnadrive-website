import { CheckCircle2 } from "lucide-react";
import { UserType } from "./types";

interface Props {
  userType: UserType | "";
}

const Feature = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <CheckCircle2 className="h-4 w-4 text-green-600" />
    <span className="text-sm">{children}</span>
  </div>
);

export default function PricingCard({ userType }: Props) {
  if (!userType) {
    return (
      <div className="rounded-3xl border bg-white p-8 shadow-lg sticky top-8">
        <h3 className="text-xl font-semibold">
          Choose your account
        </h3>

        <p className="mt-3 text-muted-foreground">
          Select whether you're a PDI, ADI or Driving School to see
          your personalised pricing.
        </p>
      </div>
    );
  }

  if (userType === "PDI") {
    return (
      <div className="rounded-3xl border bg-gradient-to-br from-green-50 to-white p-8 shadow-lg sticky top-8">
        <p className="text-green-600 font-semibold">
          PDI PLAN
        </p>

        <h2 className="mt-2 text-5xl font-bold">
          FREE
        </h2>

        <p className="mt-2 text-muted-foreground">
          While you're training.
        </p>

        <div className="mt-8 space-y-4">
          <Feature>WhatsApp AI Assistant</Feature>
          <Feature>Google Calendar Sync</Feature>
          <Feature>Unlimited Learners</Feature>
          <Feature>Route Optimisation</Feature>
        </div>
      </div>
    );
  }

  if (userType === "ADI") {
    return (
      <div className="rounded-3xl border bg-gradient-to-br from-sky-50 to-white p-8 shadow-lg sticky top-8">
        <p className="text-sky-600 font-semibold">
          DONNA DRIVE PRO
        </p>

        <div className="mt-2 flex items-end gap-1">
          <span className="text-5xl font-bold">
            £10
          </span>

          <span className="pb-2 text-muted-foreground">
            /month
          </span>
        </div>

        <p className="mt-2 text-muted-foreground">
          Cancel anytime.
        </p>

        <div className="mt-8 space-y-4">
          <Feature>WhatsApp AI Assistant</Feature>
          <Feature>Google Calendar Sync</Feature>
          <Feature>Unlimited Learners</Feature>
          <Feature>Route Optimisation</Feature>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-gradient-to-br from-amber-50 to-white p-8 shadow-lg sticky top-8">
      <p className="font-semibold text-amber-700">
        DRIVING SCHOOL
      </p>

      <h2 className="mt-2 text-3xl font-bold">
        Seat Pricing
      </h2>

      <div className="mt-8 space-y-4">

        <div className="flex justify-between">
          <span>1–5 instructors</span>
          <strong>£8 / seat</strong>
        </div>

        <div className="flex justify-between">
          <span>6–15 instructors</span>
          <strong>£7 / seat</strong>
        </div>

        <div className="flex justify-between">
          <span>16+</span>
          <strong>£6 / seat</strong>
        </div>

      </div>

      <p className="mt-8 text-sm text-muted-foreground">
        Final pricing is confirmed during your callback with Josh.
      </p>
    </div>
  );
}