import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Clock, MapPin } from "lucide-react";

const CalendarCard = () => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 40,
        scale: 0.9,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true }}
      transition={{
        delay: 4.2,
        duration: 0.6,
      }}
      className="w-full max-w-md rounded-3xl border border-border bg-white shadow-2xl overflow-hidden"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-primary to-orange-500 p-5 text-white">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">

            <Calendar className="h-6 w-6" />

          </div>

          <div>

            <p className="font-semibold">

              Google Calendar

            </p>

            <p className="text-sm text-white/80">

              Event Added Successfully

            </p>

          </div>

        </div>

      </div>

      {/* Event */}

      <div className="space-y-6 p-6">

        <div>

          <p className="text-xs uppercase tracking-wider text-muted-foreground">

            Lesson

          </p>

          <h3 className="mt-2 text-2xl font-bold">

            Driving Lesson 🚗

          </h3>

        </div>

        <div className="space-y-4">

          <div className="flex items-center gap-3">

            <Clock className="h-5 w-5 text-primary" />

            <span className="text-muted-foreground">

              Thursday • 3:30 PM

            </span>

          </div>

          <div className="flex items-center gap-3">

            <MapPin className="h-5 w-5 text-primary" />

            <span className="text-muted-foreground">

              Pick-up near learner

            </span>

          </div>

        </div>

        <div className="rounded-2xl bg-green-50 border border-green-200 p-4">

          <div className="flex items-center gap-3">

            <CheckCircle2 className="h-6 w-6 text-green-600" />

            <div>

              <p className="font-semibold text-green-700">

                Booking Confirmed

              </p>

              <p className="text-sm text-green-600">

                Donna has updated your calendar.

              </p>

            </div>

          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default CalendarCard;