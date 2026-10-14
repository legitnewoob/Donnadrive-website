import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const DonnaCard = () => {
  return (
    <motion.div
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
        delay: .4,
      }}
      className="rounded-3xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">

          <Bot className="text-primary" />

        </div>

        <div>

          <h3 className="font-bold">

            Donna AI

          </h3>

          <p className="text-sm text-muted-foreground">

            Thinking...

          </p>

        </div>

      </div>

      <div className="mt-6 space-y-3">

        {[
          "Checking Google Calendar",
          "Optimising today's route",
          "Finding best available slot",
        ].map((step, index) => (

          <motion.div
            key={step}
            initial={{
              opacity: 0,
              x: -10,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: .7 + index * .25,
            }}
            className="flex items-center gap-3 rounded-xl bg-orange-50 p-3"
          >

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
              }}
              className="h-2 w-2 rounded-full bg-primary"
            />

            <span className="text-sm">

              {step}

            </span>

          </motion.div>

        ))}

      </div>

    </motion.div>
  );
};

export default DonnaCard;