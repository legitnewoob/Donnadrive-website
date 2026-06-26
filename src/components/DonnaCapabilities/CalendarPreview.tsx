import { motion } from "framer-motion";
import {
  Calendar,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const CalendarPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .6, delay: .15 }}
      className="group h-full rounded-[32px] border bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">

          <Calendar className="h-6 w-6 text-primary" />

        </div>

        <div>

          <h3 className="text-xl font-bold">

            Google Calendar

          </h3>

          <p className="text-sm text-muted-foreground">

            Automatically synced

          </p>

        </div>

      </div>

      {/* Calendar */}

      <div className="mt-8 rounded-2xl border bg-gray-50 p-5">

        <div className="mb-4 flex items-center justify-between">

          <p className="font-semibold">

            Thursday

          </p>

          <span className="text-xs text-muted-foreground">

            Today

          </span>

        </div>

        <div className="space-y-3">

          {[
            "9:00 AM",
            "11:00 AM",
            "1:00 PM",
            "3:30 PM",
            "5:00 PM",
          ].map((time) => (

            <div
              key={time}
              className="flex items-center gap-3"
            >

              <span className="w-16 text-xs text-muted-foreground">

                {time}

              </span>

              <div className="h-px flex-1 bg-border" />

            </div>

          ))}

        </div>

        {/* Animated Booking */}

        <motion.div
          initial={{
            opacity: 0,
            x: 40,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 1.3,
            duration: .5,
          }}
          className="mt-4 rounded-xl bg-primary p-4 text-white shadow-lg"
        >

          <div className="flex items-center gap-2">

            <Clock3 className="h-4 w-4" />

            <span className="text-sm font-semibold">

              3:30 PM Driving Lesson

            </span>

          </div>

          <p className="mt-2 text-xs text-white/80">

            Added by Donna

          </p>

        </motion.div>

      </div>

      {/* Success */}

      <motion.div
        initial={{
          opacity:0,
          y:15,
        }}
        whileInView={{
          opacity:1,
          y:0,
        }}
        viewport={{
          once:true,
        }}
        transition={{
          delay:1.8,
        }}
        className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4"
      >

        <CheckCircle2 className="text-green-600"/>

        <div>

          <p className="font-semibold text-green-700">

            Calendar Updated

          </p>

          <p className="text-sm text-green-600">

            No double bookings

          </p>

        </div>

      </motion.div>

    </motion.div>
  );
};

export default CalendarPreview;