import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LayoutDashboard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import donnaSurprised from "@/assets/mascot-surprised.png";

const NotFound = () => {
  const { pathname } = useLocation();
  const signedIn = !!localStorage.getItem("dd_token");

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found · Donna Drive";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />

      <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-[#F86C4F] via-[#F47B62] to-[#F59678] text-white">
        {/* Background blobs, as on the home page */}
        <div className="absolute -left-32 -top-32 h-[300px] w-[300px] rounded-full bg-white/5 blur-2xl md:h-[500px] md:w-[500px] md:blur-3xl" />
        <div className="absolute bottom-24 right-0 h-[220px] w-[220px] rounded-full bg-white/5 blur-2xl md:h-[350px] md:w-[350px] md:blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-6 pb-36 pt-32 md:pt-36 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-4 py-1.5 text-sm font-medium md:bg-white/15">
              <span className="h-2 w-2 rounded-full bg-amber-300" />
              Error 404
            </span>

            <h1 className="mt-6 text-7xl font-black leading-none tracking-tight sm:text-8xl md:text-9xl">404</h1>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl md:text-4xl">Looks like you took a wrong turn.</h2>

            <p className="mx-auto mt-4 max-w-md text-base leading-7 text-white/85 lg:mx-0 md:text-lg">
              This road doesn't go anywhere. Donna couldn't find{" "}
              <code className="rounded-md [overflow-wrap:anywhere] bg-white/15 px-1.5 py-0.5 font-mono text-[0.9em]">{pathname}</code>, but she
              knows the way back.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="h-12 rounded-xl bg-white px-6 text-base font-semibold text-primary shadow-lg hover:bg-white/90">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
                </Link>
              </Button>
              {signedIn ? (
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/40 bg-white/10 px-6 text-base text-white hover:bg-white/20 hover:text-white">
                  <Link to="/get-onboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Go to your dashboard
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline" className="h-12 rounded-xl border-white/40 bg-white/10 px-6 text-base text-white hover:bg-white/20 hover:text-white">
                  <Link to="/book-demo">
                    <MessageCircle className="mr-2 h-4 w-4" /> Book a demo
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-first flex justify-center lg:order-none"
          >
            <img
              src={donnaSurprised}
              alt="Donna, surprised"
              className="w-40 drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)] motion-safe:animate-[nf-bob_4s_ease-in-out_infinite] sm:w-52 lg:w-[380px]"
            />
          </motion.div>
        </div>

        {/* The road: a dashed centre line that keeps moving */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-slate-800/90 md:h-28" aria-hidden>
          <div className="absolute inset-x-0 top-0 h-1.5 bg-white/70" />
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#fde68a_0_48px,transparent_48px_96px)] motion-safe:animate-[nf-road_1.6s_linear_infinite]" />
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/70" />
        </div>
      </section>

      <style>{`
        @keyframes nf-bob { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        @keyframes nf-road { from { background-position: 0 0; } to { background-position: -96px 0; } }
      `}</style>
    </div>
  );
};

export default NotFound;
