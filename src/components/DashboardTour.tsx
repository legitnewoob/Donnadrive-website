import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function DashboardTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const start = () => {
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

    let seen = false;
    try { seen = !!localStorage.getItem(TOUR_KEY); } catch {}

    const timer = forced || !seen ? setTimeout(start, forced ? 400 : 1200) : undefined;
    return () => {
      window.removeEventListener(START_TOUR_EVENT, start);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const measureTarget = useCallback(() => {
    if (!active) return;
    // The same target can exist in both the desktop sidebar and the mobile
    // bottom bar; use whichever one is actually showing.
    const el = Array.from(document.querySelectorAll<HTMLElement>(STEPS[step].selector))
      .find((node) => node.offsetParent !== null);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect(r);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Skip invisible/missing elements
      if (step < STEPS.length - 1) setStep((s) => s + 1);
      else close();
    }
  }, [active, step]);

  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget]);

  function close() {
    setActive(false);
    try { localStorage.setItem(TOUR_KEY, "true"); } catch {}
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

  const spotStyle: React.CSSProperties = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : { display: "none" };

  const tooltipStyle = getTooltipPosition(rect, current.position, pad);

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[9999]" style={{ pointerEvents: "auto" }}>
      {/* Dark overlay with cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - pad}
                y={rect.top - pad}
                width={rect.width + pad * 2}
                height={rect.height + pad * 2}
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
        className="absolute bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 max-w-xs transition-all duration-300 ease-out"
        style={{ ...tooltipStyle, pointerEvents: "auto" }}
      >
        {/* Arrow */}
        <div
          className="absolute w-3 h-3 bg-white border border-slate-200 rotate-45"
          style={getArrowStyle(current.position)}
        />

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

function getTooltipPosition(
  rect: DOMRect | null,
  position: TourStep["position"],
  pad: number
): React.CSSProperties {
  if (!rect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const gap = 16;
  const tooltipWidth = 320;

  switch (position) {
    case "bottom":
      return {
        top: rect.bottom + pad + gap,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
      };
    case "top":
      return {
        bottom: window.innerHeight - rect.top + pad + gap,
        left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - 16)),
      };
    case "left":
      return {
        top: rect.top + rect.height / 2 - 60,
        right: window.innerWidth - rect.left + pad + gap,
      };
    case "right":
      return {
        top: rect.top + rect.height / 2 - 60,
        left: rect.right + pad + gap,
      };
  }
}

function getArrowStyle(position: TourStep["position"]): React.CSSProperties {
  switch (position) {
    case "bottom":
      return { top: -7, left: "50%", transform: "translateX(-50%) rotate(45deg)", borderRight: "none", borderBottom: "none" };
    case "top":
      return { bottom: -7, left: "50%", transform: "translateX(-50%) rotate(45deg)", borderLeft: "none", borderTop: "none" };
    case "left":
      return { right: -7, top: "50%", transform: "translateY(-50%) rotate(45deg)", borderLeft: "none", borderBottom: "none" };
    case "right":
      return { left: -7, top: "50%", transform: "translateY(-50%) rotate(45deg)", borderRight: "none", borderTop: "none" };
  }
}
