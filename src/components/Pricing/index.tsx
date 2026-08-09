import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

import PricingCard from "./PricingCard";
import { plans } from "./plans";
import donnaSurprised from "@/assets/mascot-surprised.png";
import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

const Pricing = () => {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden scroll-mt-28 py-32 bg-gradient-to-b from-orange-50/20 to-background"
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

          <p className="mt-6 min-h-[1.4em] text-2xl md:text-3xl lg:text-4xl font-black text-primary">
            <Typewriter
              words={[
                "Ready to take back your evenings?",
                "Time to upgrade from the pad and paper?",
                "Ready to level up your business?",
                "Done chasing learners for replies?",
                "Ready to let Donna handle the admin?",
              ]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={60}
              deleteSpeed={35}
              delaySpeed={2000}
            />
          </p>

          <h2 className="mt-4 text-4xl md:text-5xl font-black">
            Choose Your Donna
          </h2>

          <p className="mt-6 text-lg text-muted-foreground leading-8">
            Start free. Upgrade when you're ready.
            No contracts. Cancel anytime.
          </p>

          <p className="mt-6 text-sm font-semibold text-muted-foreground">
            30 day free trial
          </p>

        </motion.div>

        <div className="mt-20 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

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
