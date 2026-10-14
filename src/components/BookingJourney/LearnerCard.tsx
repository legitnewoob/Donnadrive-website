import { motion } from "framer-motion";
import { User } from "lucide-react";

const LearnerCard = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -30,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.5,
      }}
      className="rounded-3xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

          <User className="text-blue-600" />

        </div>

        <div>

          <h3 className="font-bold">

            Learner

          </h3>

          <p className="text-sm text-muted-foreground">

            WhatsApp Message

          </p>

        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-green-50 p-4">

        <p className="text-sm">

          Hi Donna 👋

        </p>

        <p className="mt-2 text-sm">

          Can I book a lesson this Friday afternoon?

        </p>

      </div>

    </motion.div>
  );
};

export default LearnerCard;