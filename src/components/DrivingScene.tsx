import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Calendar, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const chips = [
  {
    icon: MessageCircle,
    label: "Booked over WhatsApp",
  },
  {
    icon: Calendar,
    label: "Slots filled automatically",
  },
  {
    icon: Bell,
    label: "No-shows chased for you",
  },
];

const FRAME_COUNT = 120;
const FRAME_WIDTH = 1280;
const FRAME_HEIGHT = 720;
const framePath = (i: number) =>
  `/videos/frames/frame-${String(i + 1).padStart(3, "0")}.jpg`;

/**
 * A scroll-scrubbed illustration built from a preloaded image sequence
 * drawn to a canvas, used as the section's full-bleed background (not a
 * boxed image) with content overlaid on top. Two things matter for the
 * scrub itself to feel smooth:
 *
 * 1. Drawing an already-decoded bitmap to canvas costs a fraction of a
 *    millisecond, vs several ms per seek for native <video> decode.
 * 2. The scroll->frame mapping must never call getBoundingClientRect() on
 *    every scroll tick (framer-motion's target-based useScroll does this)
 *    — that forces a synchronous layout read on every frame and, combined
 *    with anything else animating in the section, causes layout thrashing.
 *    Instead we cache the section's document offset once (recomputed only
 *    on resize) and do plain arithmetic against window.scrollY, gated to
 *    at most one update per animation frame.
 */
const DrivingScene = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const lastDrawnFrame = useRef(-1);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  const offsetRef = useRef({ top: 0, height: 0 });
  const rafScheduled = useRef(false);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete) return;
    if (lastDrawnFrame.current === index) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, FRAME_WIDTH, FRAME_HEIGHT);
    lastDrawnFrame.current = index;
  };

  useEffect(() => {
    let cancelled = false;

    // decode() (not just onload) is what guarantees a bitmap is fully
    // decoded and ready for a zero-cost drawImage — without it, the first
    // drawImage() of a frame can still pay decode cost on-demand, which is
    // exactly the kind of per-frame cost we're trying to avoid during scroll.
    // But at 1280x720 x 120 frames, decoding *all* of them before showing
    // anything took several seconds — so frame 0 gets decoded and revealed
    // on its own, and the rest decode in the background afterwards. Any
    // frame drawFrame() reaches before its own decode finishes just holds
    // on the last successfully-decoded frame (see the `img.complete` guard).
    const images: HTMLImageElement[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      images.push(img);
    }
    imagesRef.current = images;

    const decode = (img: HTMLImageElement) =>
      img.decode ? img.decode().catch(() => {}) : Promise.resolve();

    decode(images[0]).then(() => {
      if (cancelled) return;
      drawFrame(0);
      setFirstFrameReady(true);
      Promise.all(images.slice(1).map(decode));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      const mid = Math.floor(FRAME_COUNT / 2);
      const interval = setInterval(() => {
        if (imagesRef.current[mid]?.complete) {
          drawFrame(mid);
          clearInterval(interval);
        }
      }, 200);
      return () => clearInterval(interval);
    }

    const measure = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      offsetRef.current = {
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    };
    measure();

    const applyScroll = () => {
      rafScheduled.current = false;
      const { top, height } = offsetRef.current;
      const viewportHeight = window.innerHeight;
      const raw =
        (window.scrollY - top + viewportHeight) / (height + viewportHeight);
      const clamped = Math.min(Math.max((raw - 0.1) / 0.8, 0), 1);
      const frame = Math.round(clamped * (FRAME_COUNT - 1));
      drawFrame(frame);
    };

    const onScroll = () => {
      if (rafScheduled.current) return;
      rafScheduled.current = true;
      requestAnimationFrame(applyScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    applyScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#F2EEE6] min-h-[760px] h-[92vh] max-h-[980px] flex items-center"
    >
      {/* Scroll-scrubbed background */}
      <canvas
        ref={canvasRef}
        width={FRAME_WIDTH}
        height={FRAME_HEIGHT}
        className={`absolute inset-0 w-full h-full object-cover object-right transition-opacity duration-700 ${
          firstFrameReady ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Scrim: keeps the copy readable over the illustration. On mobile
          the text column spans most of the width, so it stays mostly
          opaque throughout; from md up it fades to fully transparent on
          the right so the scene reads clearly. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F2EEE6] from-40% via-[#F2EEE6]/85 via-70% to-[#F2EEE6]/45 md:from-[#F2EEE6] md:from-0% md:via-[#F2EEE6]/60 md:via-60% md:to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Built for driving instructors
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-[#1a1a2e]">
            Every learner's journey starts with{" "}
            <span className="underline decoration-primary decoration-[6px] underline-offset-4">
              one lesson.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#3a3a4e]">
            Donna keeps the diary moving between lessons — booking,
            rescheduling and reminding — so every learner gets from their
            first drive to test day without a gap in your calendar.
          </p>

          <div className="mt-8">
            <Link to="/book-demo">
              <Button
                size="lg"
                className="rounded-xl h-14 px-10 text-base font-semibold shadow-lg"
              >
                Book a Demo
              </Button>
            </Link>
          </div>

          {/* Feature chips */}
          <div className="mt-10 flex flex-col gap-3">
            {chips.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/80 px-4 py-3 w-fit"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-[#1a1a2e]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Coral wave — a clean, deliberate border separating this section from
          the next. Filled with a gradient matching MeetDonna's own coral
          gradient (not a flat fill-primary) so the wave's colour actually
          blends into the section it's leading into. */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 120"
          className="w-full h-16 lg:h-24"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="drivingSceneWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F86C4F" />
              <stop offset="50%" stopColor="#F47B62" />
              <stop offset="100%" stopColor="#F59678" />
            </linearGradient>
          </defs>
          <path
            fill="url(#drivingSceneWave)"
            d="M0,32L80,42.7C160,53,320,75,480,90.7C640,107,800,117,960,101.3C1120,85,1280,43,1360,21.3L1440,0L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default DrivingScene;
