import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import PricingCard from "./PricingCard";
import { useDisplayPlans } from "@/lib/pricing";
import donnaSurprised from "@/assets/mascot-surprised.png";
import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

const Pricing = () => {
  const rowRef = useRef<HTMLDivElement>(null);
  const { plans, sale, trialDays } = useDisplayPlans();

  // On phones, start the swipeable row on the "Most Popular" plan
  useEffect(() => {
    const row = rowRef.current;
    const popular = row?.querySelector<HTMLElement>("[data-popular]");
    if (!row || !popular || row.scrollWidth <= row.clientWidth) return;
    row.scrollLeft = popular.offsetLeft - (row.clientWidth - popular.offsetWidth) / 2;
  }, []);

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

          <p className="mt-6 text-lg text-muted-foreground leading-8">
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

        {/* Phones: one swipeable row that opens on the popular plan; grid from md up */}
        <div
          ref={rowRef}
          className="relative -mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 pt-5 [scrollbar-width:none] md:mx-0 md:mt-20 md:grid md:gap-8 md:overflow-visible md:p-0 md:grid-cols-2 lg:grid-cols-3"
        >

          {plans.map((plan, index) => (
            <div
              key={plan.slug}
              data-popular={plan.popular || undefined}
              // Same height for every card in the row, whatever badges or sale text they show
              className="flex w-[85%] shrink-0 snap-center md:w-auto"
            >
              <PricingCard
                plan={plan}
                index={index}
              />
            </div>
          ))}

        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground md:hidden">Swipe to compare plans</p>

      </div>
    </section>
  );
};

export default Pricing;
