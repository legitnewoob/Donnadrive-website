import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";

import LearnerCard from "./LearnerCard";
import DonnaCard from "./DonnaCard";
import CalendarCard from "./CalendarCard";
import SuccessCard from "./SuccessCard";

const BookingJourney = () => {
  const [playing, setPlaying] = useState(false);

  const playAnimation = () => {
    setPlaying(false);

    setTimeout(() => {
      setPlaying(true);
    }, 50);
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-32 bg-gradient-to-b from-background to-orange-50/20"
    >
      {/* Background */}

      <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-orange-300/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Heading */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            How Donna Works
          </span>

          <h2 className="mt-6 text-5xl font-black tracking-tight">
            One Message.
            <br />
            Zero Admin.
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Watch how a simple WhatsApp message turns into a confirmed
            driving lesson in seconds.
          </p>

          <Button
            size="lg"
            className="mt-10 rounded-xl"
            onClick={playAnimation}
          >
            <Play className="mr-2 h-5 w-5" />
            Watch Donna Book A Lesson
          </Button>
        </motion.div>

        {/* Journey */}

        <div className="mt-20 grid gap-6 md:grid-cols-2">

          {(playing || !playing) && (
            <>
              <div key={playing ? "l1" : "l2"}>
                <LearnerCard />
              </div>

              <div key={playing ? "d1" : "d2"}>
                <DonnaCard />
              </div>

              <div key={playing ? "c1" : "c2"}>
                <CalendarCard />
              </div>

              <div key={playing ? "s1" : "s2"}>
                <SuccessCard />
              </div>
            </>
          )}

        </div>

        {/* Bottom Stats */}

        <motion.div
          className="mt-20 grid gap-6 md:grid-cols-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[
            {
              title: "30 Seconds",
              text: "Average booking time",
            },
            {
              title: "Zero Conflicts",
              text: "Donna checks your calendar automatically",
            },
            {
              title: "24/7 Available",
              text: "Learners never wait for a reply",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border bg-white p-8 text-center shadow-sm"
            >
              <h3 className="text-3xl font-black text-primary">
                {item.title}
              </h3>

              <p className="mt-3 text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default BookingJourney;