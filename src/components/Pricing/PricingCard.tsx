import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SignupDialog from "../SignupDialog";
import type { DisplayPlan } from "@/lib/pricing";
import { gbp } from "@/lib/pricing";

interface Props {
  plan: DisplayPlan;
  index: number;
}

const PricingCard = ({ plan, index }: Props) => {
  const Icon = plan.icon;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: .5,
          delay: index * .15,
        }}
        whileHover={{
          y: -8,
        }}
        className={`
          relative
          flex
          h-full
          w-full
          flex-col
          rounded-3xl sm:rounded-[36px]
          border
          bg-white
          p-6 sm:p-8
          transition-all
          duration-300

          ${plan.popular
            ? "border-primary shadow-2xl ring-1 ring-primary"
            : "border-border shadow-sm"
          }
        `}
      >
        {plan.popular && (
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
            Most Popular
          </div>
        )}

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
        </div>

        <h3 className="mt-4 text-2xl font-black sm:mt-6">
          {plan.title}
        </h3>

        <p className="mt-2 text-muted-foreground">
          {plan.subtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-end gap-x-2 sm:mt-8">
          {plan.sale && (
            <span className="pb-1.5 text-2xl font-bold text-muted-foreground line-through decoration-rose-500/70">
              {plan.price}
            </span>
          )}
          <span className="text-4xl sm:text-5xl font-black">
            {plan.sale ? gbp(plan.sale.amount) : plan.price}
          </span>
          <span className="pb-2 text-muted-foreground">
            {plan.period}
          </span>
        </div>
        {(plan.sale || plan.trialDays > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {plan.trialDays > 0 && (
              <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                {plan.trialDays}-day free trial
              </span>
            )}
            {plan.sale && (
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                {plan.sale.label}
              </span>
            )}
          </div>
        )}
        {plan.trialDays > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Free for {plan.trialDays} days, then {plan.sale ? gbp(plan.sale.amount) : plan.price}
            {plan.period}. Cancel before it ends and you won't be charged.
          </p>
        )}

        {/* Features fill the space so every card's button lines up at the bottom */}
        <div className="mt-6 flex-1 space-y-3 sm:mt-10 sm:space-y-4">
          {plan.features.map((feature: string) => (
            <div
              key={feature}
              className="flex items-start gap-3"
            >
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Button
          className="mt-6 w-full h-12 rounded-xl sm:mt-10"
          variant={plan.popular ? "default" : "outline"}
          onClick={() => setDialogOpen(true)}
        >
          {plan.button}
        </Button>
      </motion.div>

      <SignupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
};

export default PricingCard;