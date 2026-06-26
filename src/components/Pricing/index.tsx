import { motion } from "framer-motion";

import PricingCard from "./PricingCard";
import { plans } from "./plans";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-32 bg-gradient-to-b from-orange-50/20 to-background"
    >
      <div className="absolute left-0 top-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-200/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Simple Pricing
          </span>

          <h2 className="mt-6 text-5xl font-black">
            Choose Your Donna
          </h2>

          <p className="mt-6 text-lg text-muted-foreground leading-8">
            Start free. Upgrade when you're ready.
            No contracts. Cancel anytime.
          </p>

          <div className="mt-8 inline-flex rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
            🎉 30-Day Free Trial • No Card Required
          </div>

        </motion.div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {plans.map((plan, index) => (
            <PricingCard
              key={plan.title}
              plan={plan}
              index={index}
            />
          ))}

        </div>

      </div>
    </section>
  );
};

export default Pricing;