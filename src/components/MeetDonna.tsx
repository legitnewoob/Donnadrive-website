import { motion } from "framer-motion";
import { CheckCircle2, ChevronDown } from "lucide-react";

import donnaCharacter from "@/assets/donna-drive-mascot.png";

const features = [
  {
    title: "Replies instantly",
    description: "Answers learner enquiries naturally on WhatsApp.",
  },
  {
    title: "Books lessons",
    description: "Finds the best available slot automatically.",
  },
  {
    title: "Keeps your diary organised",
    description: "Never double-books or forgets an appointment.",
  },
  {
    title: "Sends reminders",
    description: "Reduces no-shows without lifting a finger.",
  },
  {
    title: "Works around the clock",
    description: "Available 24 hours a day, 7 days a week.",
  },
  {
    title: "Learns your schedule",
    description: "Adapts to your availability and teaching style.",
  },
];

const MeetDonna = () => {
  const scrollToDemo = () => {
    document
      .getElementById("whatsapp-demo")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden py-28 lg:py-36 bg-background">

      {/* Background */}

      <div className="absolute left-0 top-32 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-orange-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="text-center"
        >

          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">

            Meet Your New Employee

          </span>

          <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">

            Meet Donna

          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-muted-foreground">

            While you're teaching learners, Donna is replying to new ones.
            She books lessons, rearranges cancellations, sends reminders and
            keeps your diary organised — all without you touching your phone.

          </p>

        </motion.div>

        {/* Mascot */}

        <motion.div
          initial={{ opacity: 0, scale: .9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: .8 }}
          className="relative mt-16 flex justify-center"
        >

          <div className="absolute h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />

          {/* <motion.img
            src={donnaCharacter}
            alt="Donna AI Receptionist"
            className="relative w-[320px] sm:w-[420px] lg:w-[500px] object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,.18)]"
            animate={{
              y: [0, -12, 0],
              rotate: [0, 1, 0, -1, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          /> */}
          <h1>DEMO HERE</h1>
        </motion.div>

        {/* Feature List */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .2 }}
          className="mt-20 grid gap-5 sm:grid-cols-2"
        >

          {features.map((feature, index) => (

            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * .08 }}
              className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all"
            >

              <CheckCircle2 className="mt-1 h-6 w-6 text-primary flex-shrink-0" />

              <div>

                <h3 className="font-semibold text-lg">

                  {feature.title}

                </h3>

                <p className="mt-1 text-muted-foreground">

                  {feature.description}

                </p>

              </div>

            </motion.div>

          ))}

        </motion.div>

        {/* CTA */}

        <motion.button
          onClick={scrollToDemo}
          className="mx-auto mt-20 flex flex-col items-center text-primary hover:opacity-80 transition-opacity"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >

          <span className="text-lg font-semibold">

            See Donna booking a lesson

          </span>

          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
          >

            <ChevronDown className="mt-3 h-7 w-7" />

          </motion.div>

        </motion.button>

      </div>

    </section>
  );
};

export default MeetDonna;