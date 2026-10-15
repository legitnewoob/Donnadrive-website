import { motion } from "framer-motion";

import PricingCard from "./PricingCard";
import { useDisplayPlans } from "@/lib/pricing";
import donnaSurprised from "@/assets/mascot-surprised.png";
import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

const Pricing = () => {
  const { plans, sale, trialDays } = useDisplayPlans();

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-16 md:py-32 bg-gradient-to-b from-orange-50/20 to-background"
    >
      <RoundaboutMapBackground />

      <div className="absolute left-0 top-32 h-80 w-80 rounded-full bg-primary/5 blur-2xl md:blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-200/10 blur-2xl md:blur-3xl" />

      <img
        src={donnaSurprised}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="hidden lg:block absolute right-0 top-16 w-[220px] xl:w-[260px] opacity-90 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] pointer-events-none"
      />

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

          <h2 className="mt-6 text-3xl md:text-5xl font-black">
            Choose Your Donna
          </h2>

          <p className="mt-4 text-base text-muted-foreground leading-7 md:mt-6 md:text-lg md:leading-8">
            Start free. Upgrade when you're ready.
            No contracts. Cancel anytime.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {sale && (
              <div className="inline-flex flex-wrap items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/20">
                <span>{sale.bannerText}</span>
                <span className="font-normal opacity-90">
                  · ends {new Date(sale.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>
            )}
            {trialDays > 0 && (
              <div className="inline-flex rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">
                🎉 {trialDays}-day free trial on paid plans • Cancel anytime
              </div>
            )}
          </div>

        </motion.div>

        {/* Phones: plans stacked one under another; side by side from md up */}
        <div className="relative mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 md:mt-20 md:max-w-none md:grid-cols-2 lg:grid-cols-3">

          {plans.map((plan, index) => (
            <div
              key={plan.slug}
              // Same height for every card in the row, whatever badges or sale text they show
              className="flex"
            >
              <PricingCard
                plan={plan}
                index={index}
              />
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Pricing;
