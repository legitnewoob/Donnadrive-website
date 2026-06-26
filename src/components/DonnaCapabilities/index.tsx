import { motion } from "framer-motion";
import CapabilityCard from "./CapabilityCard";
import { capabilities } from "./capabilities";
import { Button } from "@/components/ui/button";

const DonnaCapabilities = () => {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-50/40 to-background" />

      <div className="absolute left-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-orange-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{
            opacity: 0,
            y: 40,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: .6,
          }}
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">

            Everything Donna Can Do

          </span>

          <h2 className="mt-6 text-4xl font-black tracking-tight text-foreground md:text-5xl lg:text-6xl">

            Replace Hours of Admin
            <br />
            Every Single Week

          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">

            Donna isn't just another booking bot.

            She becomes your AI receptionist—handling enquiries,
            organising your diary, managing learners and keeping
            your driving school running smoothly.

          </p>
        </motion.div>

        {/* Cards */}

        <motion.div
          className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: .12,
              },
            },
          }}
        >
          {capabilities.map((capability) => (
            <motion.div
              key={capability.title}
              variants={{
                hidden: {
                  opacity: 0,
                  y: 40,
                },
                visible: {
                  opacity: 1,
                  y: 0,
                },
              }}
            >
              <CapabilityCard {...capability} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}

        <motion.div
          className="mt-20 rounded-[2rem] bg-gradient-to-r from-primary to-orange-500 p-12 text-center text-white shadow-2xl"
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: .6,
          }}
        >
          <h3 className="text-3xl font-black">

            And that's only the beginning.

          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">

            Donna keeps getting smarter as we build new features for
            driving instructors across the UK.

          </p>

          <Button
            size="lg"
            className="mt-8 rounded-xl bg-white px-8 text-primary hover:bg-white/90"
          >
            Watch Donna in Action
          </Button>
        </motion.div>

      </div>
    </section>
  );
};

export default DonnaCapabilities;