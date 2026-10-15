import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/api";
import { needsPlan } from "@/lib/access";

const TOUR_KEY = "dd_tour_completed";
export const START_TOUR_EVENT = "dd:start-dashboard-tour";

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
}

const STEPS: TourStep[] = [
  {
    selector: "[data-tour='stats']",
    title: "Your Key Metrics",
    description: "Track students, lessons, revenue, and growth at a glance. These update in real-time as you work.",
    position: "bottom",
  },
  {
    selector: "[data-tour='charts']",
    title: "Interactive Charts",
    description: "Revenue trends, lesson breakdown, and student growth — all visualised. Use the date filter above to change the time range.",
    position: "bottom",
  },
  {
    selector: "[data-tour='revenue-goal']",
    title: "Revenue Goal",
    description: "Track your monthly earnings against your target. This updates automatically as payments come in.",
    position: "top",
  },
  {
    selector: "[data-tour='schedule']",
    title: "Today's Schedule",
    description: "See all your lessons for today at a glance. Synced with your Google Calendar so you never miss a booking.",
    position: "top",
  },
  {
    selector: "[data-tour='phone-setup']",
    title: "WhatsApp Number",
    description: "Request a dedicated number so your learners can message Donna AI. She handles bookings, reminders, and queries 24/7.",
    position: "bottom",
  },
  {
    selector: "[data-tour='settings-link']",
    title: "Donna Settings",
    description: "Choose your working hours, how tightly Donna packs your day around your routes, and how she talks to learners. Try any change before you save it.",
    position: "right",
  },
  {
    selector: "[data-tour='portal-link']",
    title: "Your Mobile Portal",
    description: "For day-to-day management — students, calendar, Donna AI chat — open the Portal from here. It works great on your phone!",
    position: "bottom",
  },
];

// Remembered per account (from the sign-in token), not per browser, so a new
// account on a browser that has seen the tour before still gets it
function tourKey() {
  try {
    const payload = JSON.parse(atob((localStorage.getItem("dd_token") || "").split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.instructorId) return `${TOUR_KEY}:${payload.instructorId}`;
  } catch {
    // No token or not readable: fall back to the browser-wide flag
  }
  return TOUR_KEY;
}

function tourSeen() {
  try {
    return !!localStorage.getItem(tourKey());
  } catch {
    return false;
  }
}

export default function DashboardTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Never over the plan/payment modal: the tour waits until they've picked a plan (and paid)
    const locked = () => needsPlan() || new URLSearchParams(window.location.search).has("auth_code");
    const start = () => {
      if (locked()) return;
      setStep(0);
      setActive(true);
    };
    window.addEventListener(START_TOUR_EVENT, start);

    let forced = false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1") {
      forced = true;
      params.delete("tour");
      const qs = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    }

    // First visit: ask the server whether they've picked a plan (the stored flag can be
    // stale), then start once they have. Paying or picking Free signals dd_auth_change.
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    const tryStart = () => {
      if (done) return;
      // Seen is per account: someone who deleted their account and came back is new again
      if (!forced && tourSeen()) return;
      if (needsPlan()) return;
      // Back from checkout and still signing in: look again once the dashboard has finished
      if (new URLSearchParams(window.location.search).has("auth_code")) {
        timer = setTimeout(tryStart, 500);
        return;
      }
      done = true;
      timer = setTimeout(start, forced ? 400 : 1200);
    };
    const token = localStorage.getItem("dd_token");
    if (token) getProfile(token).then(tryStart).catch(() => {});
    window.addEventListener("dd_auth_change", tryStart);
    return () => {
      window.removeEventListener(START_TOUR_EVENT, start);
      window.removeEventListener("dd_auth_change", tryStart);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const tipRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  // The same target can exist in both the desktop sidebar and the mobile
  // bottom bar; use whichever one is actually showing.
  const findTarget = useCallback(
    () => Array.from(document.querySelectorAll<HTMLElement>(STEPS[step].selector)).find((node) => node.offsetParent !== null),
    [step]
  );

  // Bring each step's target on screen once. Scrolling again on every scroll event
  // fights the person's own scrolling.
  useEffect(() => {
    if (!active) return;
    const el = findTarget();
    if (!el) {
      // Skip invisible/missing elements
      if (step < STEPS.length - 1) setStep((s) => s + 1);
      else close();
      return;
    }
    scrollToTarget(el);
  }, [active, step, findTarget]);

  const measureTarget = useCallback(() => {
    if (!active) return;
    const el = findTarget();
    if (el) setRect(el.getBoundingClientRect());
  }, [active, findTarget]);

  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget]);

  // Place the tooltip once its real size is known, so it always fits on screen
  useLayoutEffect(() => {
    if (!active || !tipRef.current) return;
    const { offsetWidth, offsetHeight } = tipRef.current;
    setPlacement(placeTooltip(rect, STEPS[step].position, offsetWidth, offsetHeight));
  }, [active, rect, step]);

  function close() {
    setActive(false);
    try { localStorage.setItem(tourKey(), "true"); } catch {}
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  if (!active) return null;

  const current = STEPS[step];
  const pad = 8;

  // Keep the highlight on screen when the target is taller than the screen
  const spot = rect && {
    top: Math.max(rect.top - pad, 4),
    left: Math.max(rect.left - pad, 4),
    bottom: Math.min(rect.bottom + pad, window.innerHeight - 4),
    right: Math.min(rect.right + pad, window.innerWidth - 4),
  };
  const spotStyle: React.CSSProperties = spot
    ? { top: spot.top, left: spot.left, width: spot.right - spot.left, height: Math.max(spot.bottom - spot.top, 0) }
    : { display: "none" };

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spot && (
              <rect
                x={spot.left}
                y={spot.top}
                width={spot.right - spot.left}
                height={Math.max(spot.bottom - spot.top, 0)}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.5)"
          mask="url(#tour-mask)"
          style={{ pointerEvents: "auto" }}
        />
      </svg>

      {/* Spotlight ring */}
      {rect && (
        <div
          className="absolute rounded-xl border-2 border-sky-400 transition-all duration-300 ease-out"
          style={{ ...spotStyle, pointerEvents: "none" }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        role="dialog"
        aria-label={current.title}
        className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 transition-[top,left] duration-300 ease-out"
        style={{
          width: `min(${TOOLTIP_WIDTH}px, calc(100vw - ${EDGE * 2}px))`,
          // Hidden for the first frame, until it has been measured and placed
          ...(placement ? { top: placement.top, left: placement.left } : { top: 0, left: 0, visibility: "hidden" }),
          pointerEvents: "auto",
        }}
      >
        {/* Arrow, only when the tooltip sits right beside its target */}
        {placement?.side && (
          <div
            className="absolute w-3 h-3 bg-white border border-slate-200 rotate-45"
            style={getArrowStyle(placement.side, placement.arrowAt)}
          />
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-sm">{current.title}</h3>
          <button onClick={close} className="text-slate-400 hover:text-slate-600 shrink-0 -mt-1 -mr-1 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {current.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? "w-4 bg-sky-600" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={prev}>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button size="sm" className="h-8 rounded-lg" onClick={next}>
              {step === STEPS.length - 1 ? "Done" : "Next"}
              {step < STEPS.length - 1 && <ArrowRight className="h-3.5 w-3.5 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Scroll the target into the part of the screen below the sticky header. A section
 * taller than half the screen goes to the top, leaving room for the tooltip below.
 */
function scrollToTarget(el: HTMLElement) {
  // Things in the fixed bottom bar or header are always on screen
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (getComputedStyle(node).position === "fixed") return;
  }
  const header = Array.from(document.querySelectorAll<HTMLElement>("header")).find(
    (h) => h.offsetParent !== null && getComputedStyle(h).position === "sticky"
  );
  const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
  const r = el.getBoundingClientRect();
  const room = window.innerHeight - headerBottom;
  const offset = r.height > room * 0.5 ? 16 : (room - r.height) / 2;
  window.scrollTo({ top: window.scrollY + r.top - headerBottom - offset, behavior: "smooth" });
}

const TOOLTIP_WIDTH = 320;
// Space kept between the tooltip and the screen edges
const EDGE = 12;

type Side = TourStep["position"];

interface Placement {
  top: number;
  left: number;
  /** Which side of the target it sits on; null when pinned to the screen edge instead */
  side: Side | null;
  /** Where along the tooltip's edge the arrow points */
  arrowAt: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

/**
 * Put the tooltip on the preferred side of its target if it fits, otherwise the
 * opposite side, otherwise any side. If none fits (a phone with a tall target),
 * pin it to whichever screen edge is away from the target so Next is always reachable.
 */
function placeTooltip(rect: DOMRect | null, preferred: Side, w: number, h: number): Placement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const centred = { top: (vh - h) / 2, left: (vw - w) / 2, side: null, arrowAt: 0 };
  if (!rect) return centred;

  const gap = 20;
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  // On narrow screens there's no room beside anything, so only try above and below
  const narrow = vw < 640;
  const order: Side[] = narrow
    ? preferred === "top" ? ["top", "bottom"] : ["bottom", "top"]
    : [preferred, opposite[preferred], ...(["bottom", "top", "right", "left"] as Side[]).filter((s) => s !== preferred && s !== opposite[preferred])];

  const midX = rect.left + rect.width / 2;
  const midY = rect.top + rect.height / 2;
  const leftCentred = clamp(midX - w / 2, EDGE, vw - w - EDGE);
  const topCentred = clamp(midY - h / 2, EDGE, vh - h - EDGE);

  for (const side of order) {
    let top: number;
    let left: number;
    if (side === "bottom") { top = rect.bottom + gap; left = leftCentred; }
    else if (side === "top") { top = rect.top - gap - h; left = leftCentred; }
    else if (side === "right") { top = topCentred; left = rect.right + gap; }
    else { top = topCentred; left = rect.left - gap - w; }

    const fits = top >= EDGE && top + h <= vh - EDGE && left >= EDGE && left + w <= vw - EDGE;
    if (fits) {
      const vertical = side === "top" || side === "bottom";
      const arrowAt = vertical ? clamp(midX - left, 20, w - 20) : clamp(midY - top, 20, h - 20);
      return { top, left, side, arrowAt };
    }
  }

  // Nothing fits beside it: pin to the bottom of the screen, or the top if the target is down there
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, vh);
  const targetLow = (visibleTop + visibleBottom) / 2 > vh / 2;
  return { top: targetLow ? EDGE : vh - h - EDGE, left: (vw - w) / 2, side: null, arrowAt: 0 };
}

function getArrowStyle(side: Side, at: number): React.CSSProperties {
  switch (side) {
    case "bottom":
      return { top: -7, left: at, transform: "translateX(-50%) rotate(45deg)", borderRight: "none", borderBottom: "none" };
    case "top":
      return { bottom: -7, left: at, transform: "translateX(-50%) rotate(45deg)", borderLeft: "none", borderTop: "none" };
    case "left":
      return { right: -7, top: at, transform: "translateY(-50%) rotate(45deg)", borderLeft: "none", borderBottom: "none" };
    case "right":
      return { left: -7, top: at, transform: "translateY(-50%) rotate(45deg)", borderRight: "none", borderTop: "none" };
  }
}
