import { motion } from "framer-motion";
import { PartyPopper, Bell, CheckCircle2 } from "lucide-react";

const SuccessCard = () => {
  return (
    <motion.div
      initial={{
        opacity:0,
        scale:.9
      }}
      whileInView={{
        opacity:1,
        scale:1
      }}
      viewport={{
        once:true
      }}
      transition={{
        delay:2.2
      }}
      className="rounded-3xl border bg-gradient-to-br from-green-50 to-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">

          <PartyPopper className="text-green-600"/>

        </div>

        <div>

          <h3 className="font-bold">

            Booking Confirmed

          </h3>

          <p className="text-sm text-muted-foreground">

            Everything completed

          </p>

        </div>

      </div>

      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3">

          <CheckCircle2 className="text-green-600"/>

          <span>

            Learner notified

          </span>

        </div>

        <div className="flex items-center gap-3">

          <CheckCircle2 className="text-green-600"/>

          <span>

            Calendar synced

          </span>

        </div>

        <div className="flex items-center gap-3">

          <Bell className="text-primary"/>

          <span>

            Reminder scheduled

          </span>

        </div>

      </div>

      <div className="mt-8 rounded-2xl bg-primary p-4 text-center text-white">

        <p className="font-semibold">

          Done in under 30 seconds ⚡

        </p>

      </div>

    </motion.div>
  );
};

export default SuccessCard;