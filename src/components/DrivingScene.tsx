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
const FRAME_WIDTH = 840;
const FRAME_HEIGHT = 473;
const framePath = (i: number) =>
  `/videos/frames/frame-${String(i + 1).padStart(3, "0")}.jpg`;

/**
 * A scroll-scrubbed illustration built from a preloaded image sequence
 * drawn to a canvas. Two things matter for this to feel smooth:
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

    // decode() (not just onload) is what guarantees the bitmap is fully
    // decoded and ready for a zero-cost drawImage — without it, the first
    // drawImage() of each frame can still pay decode cost on-demand, which
    // is exactly the kind of per-frame cost we're trying to avoid.
    const images: HTMLImageElement[] = [];
    const decodePromises: Promise<void>[] = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      images.push(img);
      decodePromises.push(
        img.decode ? img.decode().catch(() => {}) : Promise.resolve()
      );
    }
    imagesRef.current = images;

    Promise.all(decodePromises).then(() => {
      if (cancelled) return;
      drawFrame(0);
      setFirstFrameReady(true);
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
      className="relative bg-background py-24 lg:py-32"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* LEFT: copy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              Built for driving instructors
            </span>

            <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
              Every learner's journey
              <br className="hidden lg:block" /> starts with one lesson.
            </h2>

            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-md mx-auto lg:mx-0">
              Donna keeps the diary moving between lessons — booking,
              rescheduling and reminding — so every learner gets from their
              first drive to test day without a gap in your calendar.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
            <div className="mt-10 flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
              {chips.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-secondary/60 border border-border px-4 py-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: pinned, scroll-scrubbed canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-secondary/40">
              <canvas
                ref={canvasRef}
                width={FRAME_WIDTH}
                height={FRAME_HEIGHT}
                className={`w-full h-auto aspect-video transition-opacity duration-500 ${
                  firstFrameReady ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DrivingScene;
