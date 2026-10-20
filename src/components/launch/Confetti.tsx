import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#F86C4F", "#f2584a", "#38bdf8", "#22c55e", "#facc15", "#a78bfa"];

/** A short, light burst from the top centre of its (relative) parent. */
export default function Confetti({ pieces = 28 }: { pieces?: number }) {
  const reduce = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        x: (Math.random() - 0.5) * 340,
        y: 120 + Math.random() * 160,
        rotate: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.15,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 5,
        h: 8 + Math.random() * 8,
        round: Math.random() > 0.6,
      })),
    [pieces]
  );
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center overflow-visible">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute top-6"
          style={{ width: b.w, height: b.round ? b.w : b.h, background: b.color, borderRadius: b.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: b.x, y: [0, -60 - Math.random() * 40, b.y], opacity: [1, 1, 0], rotate: b.rotate, scale: 1 }}
          transition={{ duration: 1.6, delay: b.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
