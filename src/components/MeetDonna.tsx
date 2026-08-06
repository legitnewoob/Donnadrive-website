import { motion } from "framer-motion";

import donnaCharacter from "@/assets/mascot-smile.png";
import roundaboutMap from "@/assets/roundabout-map.png";

const MeetDonna = () => {
  return (
    <section className="relative overflow-hidden pt-28 lg:pt-36 pb-12 lg:pb-16 bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] text-white">

      {/* Roundabout map — full-bleed across the page, very faint, larger now.
          The section is coral now (matching Hero), same as DrivingScene's
          own bottom wave, so no separate top border is needed here — that
          would just be coral-on-coral and invisible. */}
      <img
        src={roundaboutMap}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 top-0 w-full h-[620px] lg:h-[820px] object-cover object-top opacity-20 select-none pointer-events-none mix-blend-overlay"
      />

      {/* Background */}

      <div className="absolute left-0 top-32 h-72 w-72 rounded-full bg-white/10 blur-2xl md:blur-3xl" />

      <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-white/10 blur-2xl md:blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Mascot — left */}

          <motion.div
            initial={{ opacity: 0, scale: .9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: .8 }}
            className="relative flex justify-center lg:justify-start order-2 lg:order-1"
          >

            <div className="absolute h-[300px] w-[300px] sm:h-[360px] sm:w-[360px] lg:h-[420px] lg:w-[420px] rounded-full bg-white/20 blur-2xl md:blur-3xl" />

            <motion.img
              src={donnaCharacter}
              alt="Donna AI Receptionist"
              className="relative w-[260px] sm:w-[360px] lg:w-[440px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,.18)] md:drop-shadow-[0_35px_60px_rgba(0,0,0,.18)] will-change-transform"
              loading="lazy"
              decoding="async"
              animate={{
                y: [0, -12, 0],
                rotate: [0, 1, 0, -1, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Heading — right */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: .6 }}
            className="text-center lg:text-left order-1 lg:order-2"
          >

            <span className="inline-flex items-center gap-2 rounded-full bg-white/20 md:bg-white/15 md:backdrop-blur-md border border-white/20 px-4 py-2 text-sm font-semibold">

              Meet Your New Employee

            </span>

            <h2 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">

              Meet{" "}
              {/* White here, not coral — this heading sits on the coral
                  section background, where a coral underline would vanish. */}
              <span className="underline decoration-white decoration-[6px] underline-offset-4">
                Donna
              </span>

            </h2>

            <p className="mt-8 max-w-2xl mx-auto lg:mx-0 text-lg leading-9 text-white/80">

              While you're teaching learners, Donna is replying to new ones.
              She books lessons, rearranges cancellations, sends reminders and
              keeps your diary organised â€” all without you touching your phone.

            </p>

          </motion.div>

        </div>

      </div>

      {/* Bottom wave — smooths the handoff into the next section, same
          technique as Hero's own bottom wave: filled with the next
          section's colour so it reads as that colour curving up into
          the coral, not a hard cut. */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-16 lg:h-24 fill-background"
          preserveAspectRatio="none"
        >
          <path d="M0,32L80,42.7C160,53,320,75,480,90.7C640,107,800,117,960,101.3C1120,85,1280,43,1360,21.3L1440,0L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>

    </section>
  );
};

export default MeetDonna;
