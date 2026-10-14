import { motion } from "framer-motion";
import {
  GraduationCap,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

const PortalPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .6, delay: .25 }}
      className="group h-full rounded-[32px] border bg-white p-6 shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}

      <div className="flex items-center gap-3">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

          <GraduationCap className="h-6 w-6 text-blue-600" />

        </div>

        <div>

          <h3 className="font-bold text-lg">

            Student Portal

          </h3>

          <p className="text-xs text-muted-foreground">

            Everything in one place

          </p>

        </div>

      </div>

      {/* Student */}

      <div className="mt-6 rounded-2xl bg-gray-50 p-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="font-semibold">

              James Walker

            </p>

            <p className="text-xs text-muted-foreground">

              Next Lesson Tomorrow

            </p>

          </div>

          <CheckCircle2 className="text-green-500" />

        </div>

      </div>

      {/* Progress */}

      <div className="mt-6 space-y-4">

        <div>

          <div className="mb-2 flex justify-between text-sm">

            <span>Theory</span>

            <span>92%</span>

          </div>

          <div className="h-2 rounded-full bg-gray-200">

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "92%" }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="h-2 rounded-full bg-blue-500"
            />

          </div>

        </div>

        <div>

          <div className="mb-2 flex justify-between text-sm">

            <span>Driving</span>

            <span>68%</span>

          </div>

          <div className="h-2 rounded-full bg-gray-200">

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "68%" }}
              viewport={{ once: true }}
              transition={{ delay: 1.3 }}
              className="h-2 rounded-full bg-primary"
            />

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-primary/5 p-3">

        <div className="flex items-center gap-2">

          <CreditCard className="h-4 w-4 text-primary" />

          <span className="text-sm">

            Payment Received

          </span>

        </div>

        <span className="font-semibold text-primary">

          £38

        </span>

      </div>

    </motion.div>
  );
};

export default PortalPreview;