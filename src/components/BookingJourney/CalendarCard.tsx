import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock3 } from "lucide-react";

const CalendarCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: 1.4,
        duration: 0.5,
      }}
      className="rounded-3xl border bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">

          <Calendar className="text-primary" />

        </div>

        <div>

          <h3 className="font-bold">

            Google Calendar

          </h3>

          <p className="text-sm text-muted-foreground">

            Lesson Added

          </p>

        </div>

      </div>

      <motion.div
        initial={{
          opacity:0,
          y:15
        }}
        whileInView={{
          opacity:1,
          y:0
        }}
        viewport={{
          once:true
        }}
        transition={{
          delay:1.8
        }}
        className="mt-6 rounded-2xl bg-primary text-white p-5"
      >

        <div className="flex items-center gap-2">

          <Clock3 size={18}/>

          <span className="font-semibold">

            Friday • 3:30 PM

          </span>

        </div>

        <p className="mt-3 text-sm text-white/80">

          Driving Lesson

        </p>

      </motion.div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4">

        <CheckCircle2 className="text-green-600"/>

        <div>

          <p className="font-semibold text-green-700">

            Calendar Updated

          </p>

          <p className="text-sm text-green-600">

            No conflicts found

          </p>

        </div>

      </div>

    </motion.div>
  );
};

export default CalendarCard;