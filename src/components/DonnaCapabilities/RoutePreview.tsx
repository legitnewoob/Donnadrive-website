import { motion } from "framer-motion";
import {
  Route,
  Clock3,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const stops = [
  { label: "Home", color: "bg-blue-500" },
  { label: "James", color: "bg-primary" },
  { label: "Sarah", color: "bg-primary" },
  { label: "Test Centre", color: "bg-green-500" },
];

const RoutePreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: .6,
        delay: .35,
      }}
      className="group h-full rounded-[32px] border bg-white p-6 shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100">

          <Route className="h-6 w-6 text-primary" />

        </div>

        <div>

          <h3 className="font-bold text-lg">

            Smart Routes

          </h3>

          <p className="text-xs text-muted-foreground">

            Optimised automatically

          </p>

        </div>

      </div>

      {/* Route */}

      <div className="mt-8">

        {stops.map((stop, index) => (

          <div key={stop.label} className="relative flex gap-4">

            <div className="flex flex-col items-center">

              <motion.div
                initial={{
                  scale: 0,
                }}
                whileInView={{
                  scale: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: .5 + index * .2,
                }}
                className={`h-4 w-4 rounded-full ${stop.color}`}
              />

              {index !== stops.length - 1 && (
                <motion.div
                  initial={{
                    height: 0,
                  }}
                  whileInView={{
                    height: 34,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: .7 + index * .2,
                  }}
                  className="mt-1 w-0.5 bg-primary/30"
                />
              )}

            </div>

            <div className="pb-5">

              <p className="font-medium">

                {stop.label}

              </p>

              <p className="text-xs text-muted-foreground">

                {index === 0
                  ? "Start"
                  : index === stops.length - 1
                  ? "Destination"
                  : "Driving Lesson"}

              </p>

            </div>

          </div>

        ))}

      </div>

      {/* Footer */}

      <motion.div
        initial={{
          opacity:0,
          y:10,
        }}
        whileInView={{
          opacity:1,
          y:0,
        }}
        viewport={{
          once:true,
        }}
        transition={{
          delay:1.4,
        }}
        className="mt-2 rounded-2xl bg-orange-50 border border-orange-200 p-4"
      >

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Clock3 className="h-4 w-4 text-primary"/>

            <span className="text-sm">

              18 mins saved

            </span>

          </div>

          <CheckCircle2 className="text-green-600"/>

        </div>

      </motion.div>

    </motion.div>
  );
};

export default RoutePreview;