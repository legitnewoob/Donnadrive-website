import { ReactNode } from "react";

import { StationIconId } from "./stations";

/**
 * Line-art station glyphs, drawn on a 24x24 grid in the same hairline
 * style as the car illustration: no fills, round caps and joins, one
 * consistent stroke weight. Everything is `currentColor` so a single
 * `color` tween on an ancestor takes a station from grey to coral.
 */
const GLYPHS: Record<StationIconId, ReactNode> = {
  // Signpost — one wide plank crossing the post. At marker size, boards
  // hanging off one side of the post just read as a letter shape; a plank
  // the post passes through is unmistakable.
  signpost: (
    <>
      <path d="M12 22V3" />
      <path d="M4 6.5h13l3 3-3 3H4z" />
      <path d="M8 22h8" />
    </>
  ),
  // Chat bubble with a tail — the WhatsApp message itself.
  message: (
    <>
      <path d="M20.5 11.4a8 8 0 0 1-11.7 7.1L4 20l1.5-4.4A8 8 0 1 1 20.5 11.4Z" />
      <path d="M8.8 10h6.6" />
      <path d="M8.8 13.4h4" />
    </>
  ),
  // Map pin — the learner's location.
  pin: (
    <>
      <path d="M12 21.5s7-5.9 7-11.5a7 7 0 1 0-14 0c0 5.6 7 11.5 7 11.5Z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  // Diary with one slot filled — the booked lesson.
  diary: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <rect x="6.5" y="13" width="7" height="4" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  // Portal window with a tick — the change landing in the instructor's diary.
  portal: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M3 9h18" />
      <path d="m8.8 14.2 2.3 2.3 4.1-4.4" />
    </>
  ),
};

/** The glyph on its own, for use inside the road SVG's coordinate space. */
export const StationGlyphPaths = ({ id }: { id: StationIconId }) => <>{GLYPHS[id]}</>;

/** The glyph as a standalone icon, for the static (mobile / reduced-motion) list. */
export const StationIcon = ({ id, className }: { id: StationIconId; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {GLYPHS[id]}
  </svg>
);

/**
 * The travelling message — the thing the whole section follows, so it
 * carries the learner's actual words rather than abstract lines. Body and
 * tail are one continuous path (no seam where the tail meets the bubble)
 * and it's drawn centred on (0,0) so MotionPathPlugin can just place it
 * on the road.
 */
export const MessageBubble = () => (
  <>
    <path
      d="M-84 -40 H84 a16 16 0 0 1 16 16 V6 a16 16 0 0 1 -16 16 H-52 l-16 16 v-16 h-16 a16 16 0 0 1 -16 -16 V-24 a16 16 0 0 1 16 -16 Z"
      fill="#fff"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinejoin="round"
    />

    <text className="fill-foreground font-semibold" fontSize={15} x={-82} y={-14}>
      Hi Donna — can I book
    </text>
    <text className="fill-foreground font-semibold" fontSize={15} x={-82} y={6}>
      a lesson this week?
    </text>

    {/* Read receipt — the small detail that makes it read as WhatsApp. */}
    <g
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      opacity={0.6}
    >
      <path d="M58 14l3 3 6-7" />
      <path d="M66 14l3 3 6-7" />
    </g>
  </>
);
