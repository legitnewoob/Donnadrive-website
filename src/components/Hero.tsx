import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MessageCircle,
  Route,
  LayoutDashboard,
} from "lucide-react";

import donnaCharacter from "@/assets/donna-drive-mascot-hero_v2.png";
import donnaCharacterSmall from "@/assets/donna-drive-mascot-hero.png";

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

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-tight tracking-tight">

              Donna Drive

            </h1>

            <p className="mt-6 text-xl sm:text-2xl font-semibold text-white/90">

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
                  srcSet={`${donnaCharacterSmall} 566w, ${donnaCharacter} 1357w`}
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, (max-width: 1280px) 560px, 620px"
                  alt="Donna AI"
                  loading="eager"
                  decoding="async"
                  className="w-full max-w-[320px] sm:max-w-[420px] lg:max-w-[560px] xl:max-w-[620px] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] md:drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)] will-change-transform"
                />

                {/* Floating notification */}

                <motion.div
                  animate={{
                    y: [0, -8, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="absolute left-2 top-8 sm:-left-8 sm:top-12 bg-white rounded-2xl shadow-lg md:shadow-xl p-3 sm:p-4 max-w-[140px] sm:max-w-none"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">

                      ðŸ’¬

                    </div>

                    <div>

                      <p className="font-semibold text-gray-800 text-sm">

                        Lesson Booked

                      </p>

                      <p className="text-xs text-gray-500">

                        via WhatsApp

                      </p>

                    </div>

                  </div>

                </motion.div>

                {/* Floating calendar */}

                <motion.div
                  animate={{
                    y: [0, 8, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity
                  }}
                  className="absolute right-2 bottom-4 sm:-right-8 sm:bottom-10 bg-white rounded-2xl shadow-lg md:shadow-xl p-3 sm:p-4 max-w-[140px] sm:max-w-none"
                >

                  <div className="flex items-center gap-3">

                    <Calendar className="text-[#F86C4F]" />

                    <div>

                      <p className="font-semibold text-gray-800 text-sm">

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

          </motion.div>

        </div>        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <Link
              to="/ai-whatsapp-booking"
              className="group rounded-2xl bg-white/20 md:bg-white/10 md:backdrop-blur-xl border border-white/15 p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <MessageCircle className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-lg">
                AI WhatsApp
              </h3>

              <p className="mt-2 text-sm text-white/75 leading-6">
                Replies instantly, books lessons and answers learner
                questions 24/7.
              </p>
            </Link>

            <Link
              to="/smart-calendar"
              className="group rounded-2xl bg-white/20 md:bg-white/10 md:backdrop-blur-xl border border-white/15 p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <Calendar className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-lg">
                Smart Calendar
              </h3>

              <p className="mt-2 text-sm text-white/75 leading-6">
                Automatic scheduling that prevents conflicts and keeps
                your diary perfectly organised.
              </p>
            </Link>

            <Link
              to="/route-optimization"
              className="group rounded-2xl bg-white/20 md:bg-white/10 md:backdrop-blur-xl border border-white/15 p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <Route className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-lg">
                Optimised Routes
              </h3>

              <p className="mt-2 text-sm text-white/75 leading-6">
                Spend less time driving between learners and more time
                teaching.
              </p>
            </Link>

            <Link
              to="/portal"
              className="group rounded-2xl bg-white/20 md:bg-white/10 md:backdrop-blur-xl border border-white/15 p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5">
                <LayoutDashboard className="w-7 h-7" />
              </div>

              <h3 className="font-bold text-lg">
                Student Portal
              </h3>

              <p className="mt-2 text-sm text-white/75 leading-6">
                Learners can view bookings, payments and lesson progress
                anytime.
              </p>
            </Link>

          </div>
        </motion.div>

      </div>

      {/* Bottom Wave */}
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

export default Hero;
