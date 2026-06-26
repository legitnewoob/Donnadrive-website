import { motion } from "framer-motion";
import {
  MessageCircle,
  Calendar,
  Clock3,
  ShieldCheck,
} from "lucide-react";

import donnaCharacter from "@/assets/donna-drive-mascot.png";

const features = [
  {
    icon: MessageCircle,
    title: "Instant WhatsApp Replies",
    description:
      "Donna answers learner questions instantly and keeps conversations flowing even while you're teaching.",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Books lessons only when you're available and automatically avoids clashes.",
  },
  {
    icon: ShieldCheck,
    title: "No Double Bookings",
    description:
      "Every booking is checked against your calendar before it's confirmed.",
  },
  {
    icon: Clock3,
    title: "Works 24/7",
    description:
      "Even when you're asleep, Donna is booking lessons and helping learners.",
  },
];

const MeetDonna = () => {
  return (
    <section className="relative overflow-hidden py-28">

      {/* Background */}

      <div className="absolute inset-0 bg-gradient-to-b from-background via-orange-50/30 to-background" />

      <div className="absolute left-0 top-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />

      <div className="absolute right-0 bottom-0 w-96 h-96 bg-orange-300/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .7 }}
          >

            <span className="inline-flex rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-semibold">

              Your AI Receptionist

            </span>

            <h2 className="mt-6 text-5xl font-black tracking-tight text-foreground">

              Meet Donna

            </h2>

            <p className="mt-8 text-lg leading-9 text-muted-foreground max-w-xl">

              Donna isn't just another chatbot.

              She's your full-time receptionist that talks to learners,
              books lessons, keeps your diary organised, sends reminders,
              handles cancellations and works around the clock so you can
              spend more time teaching and less time doing admin.

            </p>

            {/* Stats */}

            <div className="grid grid-cols-3 gap-4 mt-12">

              <div className="rounded-2xl bg-background shadow-lg border p-6">

                <p className="text-4xl font-black text-primary">

                  24/7

                </p>

                <p className="mt-2 text-sm text-muted-foreground">

                  Always Available

                </p>

              </div>

              <div className="rounded-2xl bg-background shadow-lg border p-6">

                <p className="text-4xl font-black text-primary">

                  0

                </p>

                <p className="mt-2 text-sm text-muted-foreground">

                  Missed Enquiries

                </p>

              </div>

              <div className="rounded-2xl bg-background shadow-lg border p-6">

                <p className="text-4xl font-black text-primary">

                  ∞

                </p>

                <p className="mt-2 text-sm text-muted-foreground">

                  Conversations

                </p>

              </div>

            </div>

          </motion.div>

          {/* RIGHT */}

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="relative flex justify-center"
          >

            {/* Glow */}

            <div className="absolute w-[420px] h-[420px] bg-primary/10 rounded-full blur-3xl" />

            <motion.img
              src={donnaCharacter}
              alt="Donna AI"
              className="relative w-[420px] lg:w-[520px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,.18)]"
              animate={{
                y: [0, -12, 0],
                rotate: [0, 1.5, 0, -1.5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />            {/* Floating WhatsApp Card */}

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-10 -left-8 bg-white rounded-2xl shadow-xl p-4 border"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Lesson Booked
                  </p>

                  <p className="text-xs text-gray-500">
                    via WhatsApp
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Floating Calendar Card */}

            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute bottom-14 -right-10 bg-white rounded-2xl shadow-xl p-4 border"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>

                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Calendar Updated
                  </p>

                  <p className="text-xs text-gray-500">
                    No double bookings
                  </p>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>

        {/* Feature Cards */}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <motion.div
                key={feature.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.15,
                  duration: .5,
                }}
                className="rounded-3xl border bg-background p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >

                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">

                  <Icon className="w-7 h-7 text-primary" />

                </div>

                <h3 className="text-xl font-bold text-foreground">

                  {feature.title}

                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">

                  {feature.description}

                </p>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
};

export default MeetDonna;