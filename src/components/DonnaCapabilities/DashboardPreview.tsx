import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  Users,
  PoundSterling,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    icon: Calendar,
    label: "Today's Lessons",
    value: "12",
  },
  {
    icon: Users,
    label: "Active Students",
    value: "34",
  },
  {
    icon: PoundSterling,
    label: "Revenue",
    value: "£426",
  },
];

const DashboardPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: 0.45,
      }}
      className="group relative h-full overflow-hidden rounded-[32px] border bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Glow */}

      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}

      <div className="relative flex items-center justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">

              <BarChart3 className="h-6 w-6 text-primary" />

            </div>

            <div>

              <h3 className="text-xl font-bold">

                Donna Dashboard

              </h3>

              <p className="text-sm text-muted-foreground">

                Your business at a glance

              </p>

            </div>

          </div>

        </div>

        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">

          <TrendingUp className="h-4 w-4" />

          +18%

        </div>

      </div>

      {/* Stats */}

      <div className="relative mt-8 grid grid-cols-3 gap-4">

        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.7 + index * 0.15,
              }}
              className="rounded-2xl bg-gray-50 p-4"
            >
              <Icon className="mb-3 h-5 w-5 text-primary" />

              <motion.p
                initial={{
                  opacity: 0,
                }}
                whileInView={{
                  opacity: 1,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: 1 + index * 0.15,
                }}
                className="text-2xl font-black"
              >
                {stat.value}
              </motion.p>

              <p className="mt-1 text-xs text-muted-foreground">

                {stat.label}

              </p>

            </motion.div>
          );
        })}

      </div>

      {/* Graph */}

      <div className="relative mt-8">

        <div className="mb-4 flex items-center justify-between">

          <p className="font-semibold">

            Weekly Bookings

          </p>

          <p className="text-sm text-green-600">

            +18% this week

          </p>

        </div>

        <div className="rounded-2xl bg-gray-50 p-5">

          <svg
            viewBox="0 0 300 100"
            className="h-28 w-full"
          >
            <motion.path
              d="M10 80
                 C40 70,
                 60 60,
                 90 62
                 S150 30,
                 190 42
                 S240 55,
                 290 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-primary"
              initial={{
                pathLength: 0,
              }}
              whileInView={{
                pathLength: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 1.5,
                delay: 1.2,
              }}
            />

            <motion.circle
              cx="290"
              cy="20"
              r="6"
              fill="currentColor"
              className="text-primary"
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
                delay: 2.4,
              }}
            />

          </svg>

        </div>

      </div>
    </motion.div>
  );
};

export default DashboardPreview;