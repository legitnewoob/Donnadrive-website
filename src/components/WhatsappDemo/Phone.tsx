import { motion } from "framer-motion";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

const Phone = () => {
  return (
    <motion.div
      className="relative w-[340px] rounded-[42px] bg-[#121212] p-[10px] shadow-[0_40px_80px_rgba(0,0,0,.25)]"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
    >
      {/* Notch */}

      <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-full bg-black" />

      {/* Screen */}

      <div className="overflow-hidden rounded-[34px] bg-[#efeae2]">

        {/* Header */}

        <div className="flex items-center gap-3 bg-[#075E54] px-5 py-4 text-white">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-400 font-bold">

            D

          </div>

          <div>

            <p className="font-semibold">

              Donna

            </p>

            <p className="text-xs text-white/80">

              AI Receptionist

            </p>

          </div>

        </div>

        {/* Chat */}

        <div
          className="space-y-4 p-5"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <Message
            delay={0.2}
            side="left"
            text="Hi Donna 👋"
          />

          <Message
            delay={0.8}
            side="left"
            text="Can I book a lesson tomorrow afternoon?"
          />

          <TypingIndicator delay={1.8} />

          <Message
            delay={3}
            side="right"
            text="Absolutely! You're free tomorrow at 3:30 PM 🚗"
          />

          <Message
            delay={4}
            side="right"
            text="I've booked it and updated your calendar."
          />

          <motion.div
            initial={{
              opacity: 0,
              scale: .8,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 5,
            }}
            className="pt-3 text-center text-xs font-semibold text-green-600"
          >
            ✓ Lesson Confirmed
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
};

export default Phone;