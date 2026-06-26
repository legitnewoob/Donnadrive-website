import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import BenefitPanel from "./BenefitPanel";
import { benefits } from "./benefits";

const Benefits = () => {
  const scrollToCapabilities = () => {
    document
      .getElementById("capabilities")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-32 lg:py-40 bg-background">

      {/* Background */}

      <div className="absolute left-0 top-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="absolute right-0 bottom-0 h-[30rem] w-[30rem] rounded-full bg-orange-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">

            Why Donna Drive?

          </span>

          <h2 className="mt-6 text-5xl lg:text-6xl font-black tracking-tight">

            Get Your Evenings Back.

          </h2>

          <p className="mt-6 text-xl leading-9 text-muted-foreground">

            You're not buying another piece of software.

            You're getting your time back.

          </p>

        </motion.div>

        {/* Panels */}

        <div className="mt-24 space-y-8">

          {benefits.map((benefit, index) => (
            <BenefitPanel
              key={benefit.title}
              {...benefit}
              index={index}
            />
          ))}

        </div>

        {/* Bottom CTA */}

        <motion.div
          className="mt-24 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-lg font-semibold text-primary">

            Still think Donna is just another chatbot?

          </p>

          <motion.button
            onClick={scrollToCapabilities}
            className="mx-auto mt-8 flex flex-col items-center text-primary"
          >
            <span className="text-lg font-semibold">

              See Everything Donna Can Do

            </span>

            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.6,
              }}
            >
              <ChevronDown className="mt-3 h-7 w-7" />
            </motion.div>

          </motion.button>

        </motion.div>

      </div>

    </section>
  );
};

export default Benefits;