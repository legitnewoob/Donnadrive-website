export type StationIconId = "signpost" | "message" | "pin" | "diary" | "portal";

export type Station = {
  id: StationIconId;
  step: string;
  title: string;
  body: string;
  /**
   * Where the station sits along the road, as an x in viewBox units. The
   * progress along the path (which drives the message's travel, the coral
   * trail and the marker's own position) is solved from this at runtime —
   * so the stations line up with the road's knots by construction instead
   * of by hand-tuned progress numbers that drift when the road changes.
   */
  x: number;
};

export const STATIONS: Station[] = [
  {
    id: "signpost",
    step: "01",
    title: "Add your learner",
    body: "One tap adds them to your portal. That's the only setup.",
    x: 138,
  },
  {
    id: "message",
    step: "02",
    title: "They message Donna",
    body: "Your learner texts Donna on WhatsApp to book, move or cancel a lesson.",
    x: 429,
  },
  {
    id: "pin",
    step: "03",
    title: "Donna checks the details",
    body: "She matches their location against your diary and your preferences.",
    x: 720,
  },
  {
    id: "diary",
    step: "04",
    title: "She books the slot",
    body: "Donna finds a time that works for you both and locks it in.",
    x: 1011,
  },
  {
    id: "portal",
    step: "05",
    title: "You stay in control",
    body: "Every change lands in your portal, so your diary's always right — without the admin.",
    x: 1302,
  },
];

/** Road viewBox. The stage is locked to this aspect ratio so the card can
 *  be positioned as plain percentages of these units. */
export const VIEW_W = 1440;
export const VIEW_H = 540;

/**
 * The road runs across the top two-thirds; the card sits in the clear band
 * underneath. One card is on screen at a time, so it never has to share
 * that band and can stay big enough to actually read.
 */
export const CARD_W = 380;
export const CARD_TOP = 310;

/**
 * The road. Every join uses horizontal control points on both sides, so
 * the cubics meet as one continuously smooth curve rather than segments
 * with visible kinks.
 *
 * Both ends run past the edge of the stage on purpose: they're faded out
 * by a gradient mask, and a stroke's flat end cap has to sit where that
 * mask is already fully transparent — otherwise you see the cut.
 */
export const ROAD_D =
  "M-30 260 C40 260 80 260 138 260 " +
  "C280 260 290 140 429 140 " +
  "C570 140 580 260 720 260 " +
  "C860 260 870 140 1011 140 " +
  "C1150 140 1160 220 1302 220 " +
  "C1360 220 1400 220 1470 220";

/** How far in from each edge the road fades up to full opacity. */
export const ROAD_FADE = 0.05;

/** Keeps the card on the stage when its station is near either end. */
export const cardLeft = (x: number) =>
  Math.min(Math.max(x - CARD_W / 2, 10), VIEW_W - CARD_W - 10);

export const pctX = (x: number) => `${(x / VIEW_W) * 100}%`;
export const pctY = (y: number) => `${(y / VIEW_H) * 100}%`;
