import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import Phone from "./Phone";
import CalendarCard from "./CalendarCard";

const WhatsAppDemo = () => {
  const scrollToCapabilities = () => {
    document
      .getElementById("capabilities")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="whatsapp-demo"
      className="relative overflow-hidden py-32 lg:py-40 bg-gradient-to-b from-background to-orange-50/30"
    >
      {/* Background */}

      <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">

            Live Demo

          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">

            Watch Donna Work

          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">

            A learner sends one WhatsApp message.

            Donna replies instantly, books the lesson,
            updates your calendar and sends a confirmation—
            all in seconds.

          </p>
        </motion.div>

        {/* Demo */}

        <div className="mt-24 grid items-center gap-16 lg:grid-cols-2">

          {/* Phone */}

          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .7 }}
            className="flex justify-center"
          >
            <Phone />
          </motion.div>

          {/* Calendar */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .7 }}
            className="flex justify-center lg:justify-start"
          >
            <CalendarCard />
          </motion.div>

        </div>

        {/* Bottom Copy */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .4 }}
          className="mt-20 text-center"
        >
          <h3 className="text-3xl font-black">

            No phone calls.
            <br />
            No endless WhatsApp messages.
            <br />
            No diary juggling.

          </h3>

          <p className="mt-6 text-lg text-muted-foreground">

            Donna handles the admin while you focus on teaching.

          </p>

          <motion.button
            onClick={scrollToCapabilities}
            className="mx-auto mt-12 flex flex-col items-center text-primary hover:opacity-80 transition"
          >
            <span className="font-semibold text-lg">

              See Everything Donna Can Do

            </span>

            <motion.div
              animate={{
                y: [0, 8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
              }}
            >
              <ChevronDown className="mt-2 h-7 w-7" />
            </motion.div>
          </motion.button>

        </motion.div>

      </div>
    </section>
  );
};

export default WhatsAppDemo;