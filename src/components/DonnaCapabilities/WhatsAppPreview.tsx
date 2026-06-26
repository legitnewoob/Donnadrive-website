import { motion } from "framer-motion";
import { MessageCircle, CheckCircle2 } from "lucide-react";

const bubble = {
  hidden: {
    opacity: 0,
    y: 15,
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.45,
    },
  }),
};

const WhatsAppPreview = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="group h-full rounded-[32px] border bg-white p-8 shadow-sm hover:shadow-2xl transition-all duration-300"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">

            <MessageCircle className="h-6 w-6 text-green-600" />

          </div>

          <div>

            <h3 className="font-bold text-xl">

              WhatsApp Booking

            </h3>

            <p className="text-sm text-muted-foreground">

              Donna chats with learners

            </p>

          </div>

        </div>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">

          LIVE

        </span>

      </div>

      {/* Chat */}

      <div className="mt-8 space-y-4">

        <motion.div
          custom={0.2}
          variants={bubble}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-[75%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3"
        >
          <p className="text-sm">

            Hi Donna 👋

          </p>
        </motion.div>

        <motion.div
          custom={0.6}
          variants={bubble}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-[80%] rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3"
        >
          <p className="text-sm">

            Can I book Friday afternoon?

          </p>
        </motion.div>

        {/* Typing */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 }}
          className="flex"
        >
          <div className="rounded-2xl bg-white border px-4 py-3 shadow-sm">

            <div className="flex gap-2">

              {[0,1,2].map(dot=>(
                <motion.div
                  key={dot}
                  className="h-2.5 w-2.5 rounded-full bg-gray-400"
                  animate={{
                    opacity:[.3,1,.3],
                    y:[0,-2,0]
                  }}
                  transition={{
                    repeat:Infinity,
                    duration:1,
                    delay:dot*.15
                  }}
                />
              ))}

            </div>

          </div>
        </motion.div>

        <motion.div
          custom={1.8}
          variants={bubble}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-white"
        >
          <p className="text-sm">

            You're booked for Friday at 3:30 PM 🚗

          </p>
        </motion.div>

      </div>

      {/* Success */}

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
        className="mt-8 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 p-4"
      >

        <CheckCircle2 className="text-green-600"/>

        <div>

          <p className="font-semibold text-green-700">

            Lesson Confirmed

          </p>

          <p className="text-sm text-green-600">

            Calendar updated automatically

          </p>

        </div>

      </motion.div>

    </motion.div>
  );
};

export default WhatsAppPreview;