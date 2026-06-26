import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  plan: any;
  index: number;
}

const PricingCard = ({ plan, index }: Props) => {
  const Icon = plan.icon;

  return (
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
        rounded-[36px]
        border
        bg-white
        p-8
        transition-all
        duration-300

        ${
          plan.popular
            ? "border-primary shadow-2xl lg:scale-105"
            : "border-border shadow-sm"
        }
      `}
    >
      {plan.popular && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">
          Most Popular
        </div>
      )}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>

      <h3 className="mt-6 text-2xl font-black">
        {plan.title}
      </h3>

      <p className="mt-2 text-muted-foreground">
        {plan.subtitle}
      </p>

      <div className="mt-8 flex items-end gap-2">

        <span className="text-5xl font-black">
          {plan.price}
        </span>

        <span className="pb-2 text-muted-foreground">
          {plan.period}
        </span>

      </div>

      <div className="mt-10 space-y-4">

        {plan.features.map((feature: string) => (
          <div
            key={feature}
            className="flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-green-600" />

            <span>{feature}</span>

          </div>
        ))}

      </div>

      <Button
        className="mt-10 w-full h-12 rounded-xl"
        variant={plan.popular ? "default" : "outline"}
      >
        {plan.button}
      </Button>
    </motion.div>
  );
};

export default PricingCard;