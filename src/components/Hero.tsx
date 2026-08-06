import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import donnaCharacter from "@/assets/mascot-confident.png";
import FeatureMarquee from "@/components/FeatureMarquee";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] text-white">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-white/5 blur-2xl md:blur-3xl -top-32 -left-32" />
        <div className="absolute w-[220px] h-[220px] md:w-[350px] md:h-[350px] rounded-full bg-white/5 blur-2xl md:blur-3xl bottom-0 right-0" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-36 pb-20">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* LEFT SIDE */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .6 }}
            className="text-center lg:text-left will-change-transform"
          >

            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 md:bg-white/15 md:backdrop-blur-md border border-white/20 px-5 py-2 mb-8">

              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

              <span className="text-sm font-medium">
                AI Assistant for Driving Schools
              </span>

            </div>

            {/* Heading */}

            <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-black leading-[0.95] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.15)]">

              Donna Drive

            </h1>

            <p className="mt-8 text-xl sm:text-2xl font-semibold text-white/90">

              Booking Assistant & Smart Calendar

            </p>

            <p className="mt-8 text-lg leading-8 text-white/80 max-w-xl mx-auto lg:mx-0">

              Donna books lessons through WhatsApp, manages your
              calendar, handles cancellations and keeps your driving
              school running 24/7 while you stay focused on teaching.

            </p>

            {/* Buttons */}

            <div className="flex flex-col sm:flex-row gap-5 mt-10 justify-center lg:justify-start">

              <Link to="/book-demo">

                <Button
                  size="lg"
                  className="rounded-xl bg-white text-[#F86C4F] hover:bg-white/90 h-14 px-10 text-base font-semibold shadow-xl"
                >

                  Book a Demo

                </Button>

              </Link>

              <a href="#how-it-works">

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl border-white/30 bg-white/15 md:bg-white/10 md:backdrop-blur-md text-white hover:bg-white/20 h-14 px-10"
                >

                  See How It Works

                </Button>

              </a>

            </div>

          </motion.div>

          {/* RIGHT SIDE */}

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: .8 }}
            className="flex justify-center lg:justify-end will-change-transform"
          >

            <div className="relative">

              {/* Glow */}

              <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl md:blur-3xl scale-110" />

              {/* Floating card */}

              <motion.div
                animate={{
                  y: [0, -12, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative will-change-transform"
              >

                <img
                  src={donnaCharacter}
                  alt="Donna AI"
                  loading="eager"
                  decoding="async"
                  className="w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[560px] xl:max-w-[620px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)] will-change-transform"
                />

              </motion.div>

            </div>

          </motion.div>

        </div>

        {/* Feature Cards — continuous marquee, pauses + expands on hover */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-4 relative left-1/2 right-1/2 -mx-[50vw] w-screen"
        >
          <FeatureMarquee />
        </motion.div>

      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-16 lg:h-24 fill-[#F2EEE6]"
          preserveAspectRatio="none"
        >
          <path d="M0,32L80,42.7C160,53,320,75,480,90.7C640,107,800,117,960,101.3C1120,85,1280,43,1360,21.3L1440,0L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>

    </section>
  );
};

export default Hero;
