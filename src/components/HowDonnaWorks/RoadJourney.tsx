import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

import SectionHeading from "./SectionHeading";
import StationCard from "./StationCard";
import { MessageBubble, StationGlyphPaths } from "./icons";
import {
  CARD_TOP,
  CARD_W,
  ROAD_D,
  ROAD_FADE,
  STATIONS,
  VIEW_H,
  VIEW_W,
  cardLeft,
  pctX,
  pctY,
} from "./stations";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/** The quiet state: unlaid road, and stations the message hasn't reached. */
const HAIRLINE = "hsl(214, 20%, 82%)";
const TARMAC_GREY = "hsl(214, 22%, 93%)";

const ROAD_W = 46;
const MARKER_R = 34;
const GLYPH_SIZE = 32;
/** How far the message lifts off the road while a station is working, so
 *  it stops covering the marker it just arrived at. */
const LIFT = 80;

/**
 * The journey is authored as beats, not as one continuous sweep: the
 * message drives a leg, then everything stops while that station has its
 * moment. HOLD is what makes the pauses read as pauses — through it,
 * nothing on screen moves at all.
 */
const DRAW = 0.8; // the road lays itself down
const ACTIVATE = 0.4; // a station lighting up + its card arriving
const HOLD = 1.2; // the pause on a station
const SPAWN = 0.35; // the message appearing at the kerb
const TRAVEL = 1.35; // one leg of the road

/** Absolute beat times, derived once so every layer agrees on them. */
const schedule = () => {
  const activate: number[] = [];
  const legs: { at: number }[] = [];

  let t = DRAW;
  activate[0] = t;
  t += ACTIVATE + HOLD;

  const spawn = t;
  t += SPAWN;

  for (let i = 1; i < STATIONS.length; i++) {
    legs.push({ at: t });
    t += TRAVEL;
    activate[i] = t;
    t += ACTIVATE + HOLD;
  }

  return { activate, legs, spawn, total: t };
};

/** Reads a brand HSL token into a colour string GSAP can interpolate (it
 *  can't parse `var(--primary)`), so index.css stays the source of truth. */
const brandColor = (token: string, fallback: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const parts = raw.split(/\s+/);
  return parts.length === 3 ? `hsl(${parts[0]}, ${parts[1]}, ${parts[2]})` : fallback;
};

const RoadJourney = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<SVGPathElement>(null);
  const drawRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const riderRef = useRef<SVGGElement>(null);
  const bubbleRef = useRef<SVGGElement>(null);

  // A station is nested <g>s: the outer carries its position on the road
  // (written once, imperatively), the marker is what GSAP colours and pops,
  // and the ping ring sits outside the marker so its scale doesn't compound.
  const slotRefs = useRef<(SVGGElement | null)[]>([]);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const pingRefs = useRef<(SVGCircleElement | null)[]>([]);
  const stemRefs = useRef<(SVGLineElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const road = roadRef.current;
    const draw = drawRef.current;
    const trail = trailRef.current;
    if (!road || !draw || !trail) return;

    const coral = brandColor("--primary", "hsl(6, 85%, 60%)");

    const rawPath = MotionPathPlugin.getRawPath(road);
    MotionPathPlugin.cacheRawPathMeasurements(rawPath);

    // The road only ever moves left to right, so its x is monotonic and a
    // station's x can be turned into a path progress by bisection.
    const progressAtX = (targetX: number) => {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 26; i++) {
        const mid = (lo + hi) / 2;
        if (MotionPathPlugin.getPositionOnPath(rawPath, mid).x < targetX) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    };

    const progress = STATIONS.map((station) => progressAtX(station.x));

    // Drop each marker onto the road, and run its stem down to the card.
    progress.forEach((p, i) => {
      const point = MotionPathPlugin.getPositionOnPath(rawPath, p);
      slotRefs.current[i]?.setAttribute("transform", `translate(${point.x} ${point.y})`);

      const stem = stemRefs.current[i];
      if (stem) {
        const length = CARD_TOP - point.y - MARKER_R;
        stem.setAttribute("y2", String(MARKER_R + length));
        stem.style.strokeDasharray = String(length);
        stem.style.strokeDashoffset = String(length);
      }
    });

    const ctx = gsap.context(() => {
      const markers = markerRefs.current.filter(Boolean) as SVGGElement[];
      const pings = pingRefs.current.filter(Boolean) as SVGCircleElement[];
      const stems = stemRefs.current.filter(Boolean) as SVGLineElement[];
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];

      const { activate, legs, spawn, total } = schedule();
      const roadLength = draw.getTotalLength();
      /** Dash offset for a trail filled to `p` of the road. */
      const trailAt = (p: number) => roadLength * (1 - p);
      const stemLength = (i: number) => Number(stems[i].style.strokeDasharray);

      gsap.set(draw, { strokeDasharray: roadLength, strokeDashoffset: roadLength });
      // Starts with nothing coloured: the whole road greys in first, and
      // only then does the journey start marking it.
      gsap.set(trail, { strokeDasharray: roadLength, strokeDashoffset: trailAt(0) });
      gsap.set(markers, { color: HAIRLINE, opacity: 0 });
      gsap.set(pings, { opacity: 0, scale: 1, transformOrigin: "50% 50%" });
      gsap.set(cards, { opacity: 0, y: 26, scale: 0.97 });
      // MotionPath only writes the rider's transform once a leg runs, so
      // park it on the first station up front — otherwise the message would
      // spawn at the SVG's origin instead of at the kerb.
      const start = MotionPathPlugin.getPositionOnPath(rawPath, progress[0]);
      gsap.set(riderRef.current, { opacity: 0, x: start.x, y: start.y });
      gsap.set(bubbleRef.current, { scale: 0.5, y: 0, transformOrigin: "50% 50%" });

      // One scroll gesture should land on the next checkpoint, not park the
      // message halfway down a leg. Snapping to the middle of each hold
      // means a nudge in either direction plays that whole leg as a single
      // motion and settles.
      const snapPoints = [
        0,
        ...activate.map((at) => (at + ACTIVATE + HOLD * 0.5) / total),
        1,
      ];

      const tl = gsap.timeline({
        // fromTo everywhere with immediateRender off: every beat then has
        // explicit start values, so a ScrollTrigger refresh mid-section
        // (resize, late-loading images above) re-inits to the same states
        // instead of baking in whatever half-finished values were on screen.
        defaults: { ease: "none", immediateRender: false },
        scrollTrigger: {
          trigger: pinRef.current,
          start: "top top",
          // Long enough that every leg and every pause gets real scroll
          // distance of its own — the pauses are the point.
          end: "+=340%",
          pin: pinRef.current,
          anticipatePin: 1,
          scrub: 0.4,
          snap: {
            snapTo: snapPoints,
            duration: { min: 0.2, max: 0.7 },
            delay: 0.04,
            ease: "power2.inOut",
            // Without this, a quick flick projects by velocity and skips
            // several stations at once. Off, it always settles on the next
            // checkpoint in the direction you scrolled.
            inertia: false,
          },
          invalidateOnRefresh: true,
        },
      });

      // 1. The road lays itself down, in grey. Nothing is coral yet.
      tl.fromTo(
        draw,
        { strokeDashoffset: roadLength },
        { strokeDashoffset: 0, duration: DRAW, ease: "power1.inOut" },
        0
      );

      // Stations arrive with the stretch of road that carries them.
      progress.forEach((p, i) => {
        tl.fromTo(markers[i], { opacity: 0 }, { opacity: 1, duration: 0.18 }, p * DRAW);
      });

      // 2. The message shows up at the kerb, from the learner just added.
      tl.fromTo(
        riderRef.current,
        { opacity: 0 },
        { opacity: 1, duration: SPAWN * 0.5 },
        spawn
      ).fromTo(
        bubbleRef.current,
        { scale: 0.5, y: -LIFT },
        { scale: 1, y: -LIFT, duration: SPAWN, ease: "back.out(1.8)" },
        spawn
      );

      // 3. Each leg: drop onto the road, pull away, drive, arrive, lift off
      //    again. The coral trail fills in behind the message on exactly the
      //    same curve and easing, so the road you've covered is always the
      //    road that's coloured.
      legs.forEach(({ at }, leg) => {
        const from = progress[leg];
        const to = progress[leg + 1];

        tl.to(
          riderRef.current,
          {
            duration: TRAVEL,
            ease: "power2.inOut",
            // No `align`: it measures the target's current offset and
            // compensates for it, which silently cancels the lift applied
            // to the inner group. The bubble is drawn around the origin in
            // the same user units as the path, so the raw path coordinates
            // already centre it on the road.
            motionPath: { path: road, autoRotate: false, start: from, end: to },
          },
          at
        )
          .fromTo(
            trail,
            { strokeDashoffset: trailAt(from) },
            { strokeDashoffset: trailAt(to), duration: TRAVEL, ease: "power2.inOut" },
            at
          )
          // Settles onto the road to drive, leans into it, then lifts clear
          // of the marker it arrives at.
          .fromTo(
            bubbleRef.current,
            { y: -LIFT, rotation: 0 },
            { y: 0, rotation: -4, duration: TRAVEL * 0.3, ease: "power2.out" },
            at
          )
          .to(
            bubbleRef.current,
            { y: -LIFT, rotation: 0, duration: TRAVEL * 0.35, ease: "back.out(1.8)" },
            at + TRAVEL * 0.65
          );
      });

      // 4. Each station's moment: the marker turns coral and pings, a stem
      //    runs down to the card, and the card lands. The card from the
      //    previous station has already gone, so there's only ever one
      //    thing on screen asking to be read.
      STATIONS.forEach((_, i) => {
        const at = activate[i];

        tl.fromTo(markers[i], { color: HAIRLINE }, { color: coral, duration: ACTIVATE * 0.6 }, at)
          .fromTo(
            markers[i],
            { scale: 1 },
            {
              scale: 1.18,
              duration: ACTIVATE * 0.35,
              yoyo: true,
              repeat: 1,
              transformOrigin: "50% 50%",
            },
            at
          )
          .fromTo(
            pings[i],
            { opacity: 0.5, scale: 1 },
            { opacity: 0, scale: 2.2, duration: ACTIVATE * 2, ease: "power2.out" },
            at
          )
          .fromTo(
            stems[i],
            { strokeDashoffset: stemLength(i) },
            { strokeDashoffset: 0, duration: ACTIVATE * 0.7, ease: "power2.out" },
            at + 0.05
          )
          .fromTo(
            cards[i],
            { opacity: 0, y: 26, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: ACTIVATE, ease: "back.out(1.4)" },
            at + 0.16
          );

        // The first station sits a little way in from where the road starts,
        // so its own beat colours that opening stretch — the road is fully
        // grey until the journey actually reaches it.
        if (i === 0) {
          tl.fromTo(
            trail,
            { strokeDashoffset: trailAt(0) },
            { strokeDashoffset: trailAt(progress[0]), duration: ACTIVATE, ease: "power1.out" },
            at
          );
        }

        // Clears the way for the next one as the message pulls away.
        if (i < legs.length) {
          tl.to(
            cards[i],
            { opacity: 0, y: 18, scale: 0.98, duration: ACTIVATE * 0.7 },
            legs[i].at
          ).to(
            stems[i],
            { strokeDashoffset: stemLength(i), duration: ACTIVATE * 0.7 },
            legs[i].at
          );
        }
      });

      // 5. The last station sits short of the road's end, so the final
      //    stretch colours in on arrival — otherwise the journey finishes
      //    with a grey stub hanging off the right.
      const last = STATIONS.length - 1;
      tl.fromTo(
        trail,
        { strokeDashoffset: trailAt(progress[last]) },
        { strokeDashoffset: trailAt(1), duration: ACTIVATE * 1.6, ease: "power1.out" },
        activate[last]
      )
        // The message hands off to the booking itself — the last card's
        // portal feed is where it lands.
        .to(
          riderRef.current,
          { opacity: 0, scale: 0.85, duration: ACTIVATE * 0.9, ease: "power2.in" },
          activate[last] + 0.5
        )
        .to({}, { duration: 0.01 }, total);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      {/* pt clears the floating header: the pinned content is centred in a
          full screen, so without it the heading sits under the nav bar. */}
      <div ref={pinRef} className="h-screen flex flex-col justify-center gap-5 px-6 pt-24 pb-8">
        <SectionHeading compact />

        {/* Locked to the road's aspect ratio, so the cards can be placed as
            plain percentages of the SVG's own coordinates. The second
            max-width term trades width for height on short laptops:
            whatever height is left after the heading and padding caps the
            width, so the pinned section can never outgrow the screen it's
            pinned to. `containerType` makes 1cqw = 1% of the stage, which
            is what keeps the card's proportions — and so the vertical
            budget under the road — identical at every stage size. */}
        <div
          className="relative mx-auto w-full"
          style={{
            aspectRatio: `${VIEW_W} / ${VIEW_H}`,
            maxWidth: `min(1400px, calc((100vh - 230px) * ${VIEW_W / VIEW_H}))`,
            containerType: "inline-size",
          }}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="absolute inset-0 h-full w-full text-primary"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              {/* Softens both ends of the road into the page, so it reads
                  as carrying on off-stage rather than being chopped off. */}
              <linearGradient
                id="hdw-fade-grad"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2={VIEW_W}
                y2="0"
              >
                <stop offset="0" stopColor="#000" />
                <stop offset={ROAD_FADE} stopColor="#fff" />
                <stop offset={1 - ROAD_FADE} stopColor="#fff" />
                <stop offset="1" stopColor="#000" />
              </linearGradient>

              <mask
                id="hdw-fade"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
              >
                <rect width={VIEW_W} height={VIEW_H} fill="url(#hdw-fade-grad)" />
              </mask>

              {/* Lays the road on, and fills the coral in behind the
                  message: one fat stroke whose dash offset is scrubbed,
                  revealing every road layer under it at once — including
                  the dashed centre line, which can't animate its own dash
                  offset because its dashes are the markings. */}
              <mask
                id="hdw-draw"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
              >
                <path ref={drawRef} d={ROAD_D} stroke="#fff" strokeWidth={ROAD_W + 8} />
              </mask>

              <mask
                id="hdw-trail"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
              >
                <path ref={trailRef} d={ROAD_D} stroke="#fff" strokeWidth={ROAD_W + 8} />
              </mask>

              {/* A white band minus a narrower black one — the two kerb
                  lines, without needing offset copies of the path. */}
              <mask
                id="hdw-edges"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={VIEW_W}
                height={VIEW_H}
              >
                <path d={ROAD_D} stroke="#fff" strokeWidth={ROAD_W} />
                <path d={ROAD_D} stroke="#000" strokeWidth={ROAD_W - 7} />
              </mask>
            </defs>

            <g mask="url(#hdw-fade)">
              {/* The road ahead — laid in grey and left quiet. */}
              <g mask="url(#hdw-draw)" style={{ color: HAIRLINE }}>
                <path d={ROAD_D} stroke={TARMAC_GREY} strokeWidth={ROAD_W} />
                <g mask="url(#hdw-edges)">
                  <path d={ROAD_D} stroke="currentColor" strokeWidth={ROAD_W} />
                </g>
                <path
                  d={ROAD_D}
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeDasharray="16 20"
                  strokeLinecap="round"
                />
              </g>

              {/* The road covered — coral, filling in behind the message. */}
              <g mask="url(#hdw-trail)">
                <path d={ROAD_D} stroke="currentColor" strokeWidth={ROAD_W} opacity={0.12} />
                <g mask="url(#hdw-edges)">
                  <path d={ROAD_D} stroke="currentColor" strokeWidth={ROAD_W} opacity={0.9} />
                </g>
                <path
                  d={ROAD_D}
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeDasharray="16 20"
                  strokeLinecap="round"
                  opacity={0.55}
                />
              </g>
            </g>

            {/* Measured for the station positions and driven by MotionPath —
                never painted itself. */}
            <path ref={roadRef} d={ROAD_D} stroke="none" />

            {STATIONS.map((station, i) => (
              <g
                key={station.id}
                ref={(el) => {
                  slotRefs.current[i] = el;
                }}
              >
                <line
                  ref={(el) => {
                    stemRefs.current[i] = el;
                  }}
                  x1={0}
                  y1={MARKER_R}
                  x2={0}
                  y2={MARKER_R}
                  stroke="currentColor"
                  strokeWidth={1.5}
                  opacity={0.45}
                />

                <circle
                  ref={(el) => {
                    pingRefs.current[i] = el;
                  }}
                  r={MARKER_R}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                />

                <g
                  ref={(el) => {
                    markerRefs.current[i] = el;
                  }}
                >
                  <circle r={MARKER_R} fill="#fff" stroke="currentColor" strokeWidth={1.8} />
                  <g
                    transform={`translate(${-GLYPH_SIZE / 2} ${-GLYPH_SIZE / 2}) scale(${
                      GLYPH_SIZE / 24
                    })`}
                    stroke="currentColor"
                    strokeWidth={1.7}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <StationGlyphPaths id={station.id} />
                  </g>
                </g>
              </g>
            ))}

            {/* Outer group rides the path; inner one does the lift, lean and
                pop, so MotionPath's transform never fights them. */}
            <g ref={riderRef}>
              <g ref={bubbleRef}>
                <MessageBubble />
              </g>
            </g>
          </svg>

          {/* Cards — HTML rather than SVG so they're real product UI in the
              site's own components. One is on screen at a time, stacked in
              the same band under the road. */}
          {STATIONS.map((station, i) => (
            <div
              key={station.id}
              className="pointer-events-none absolute"
              style={{
                left: pctX(cardLeft(station.x)),
                top: pctY(CARD_TOP),
                width: pctX(CARD_W),
                fontSize: "0.95cqw",
              }}
            >
              <div
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <StationCard station={station} />
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default RoadJourney;
