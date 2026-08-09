import { Check, MapPin } from "lucide-react";

import { StationIcon } from "./icons";
import { Station, StationIconId } from "./stations";

/**
 * Sized entirely in `em` so the card keeps its proportions at any scale.
 * On the road, the stage sets a font-size in container units, so the card
 * occupies the same slice of the road's coordinate space whether the stage
 * is 1100px or 1400px wide — which is what lets the layout budget below
 * the road be fixed. In the static list it just inherits 16px.
 */

/**
 * A small piece of the real product under each step — the point is that
 * the journey shows what Donna does, rather than describing it.
 */
const VISUALS: Record<StationIconId, JSX.Element> = {
  signpost: (
    <div className="flex items-center gap-[0.6em] rounded-[0.5em] border border-border bg-muted/40 px-[0.7em] py-[0.55em]">
      <span className="flex h-[1.7em] w-[1.7em] shrink-0 items-center justify-center rounded-full bg-primary/15 text-[0.62em] font-bold text-primary">
        EM
      </span>
      <span className="text-[0.86em] font-semibold text-foreground">Ellie M.</span>
      <span className="ml-auto rounded-full bg-primary px-[0.7em] py-[0.2em] text-[0.66em] font-bold text-primary-foreground">
        Added
      </span>
    </div>
  ),

  message: (
    <div className="rounded-[0.5em] rounded-bl-[0.15em] border border-border bg-muted/40 px-[0.7em] py-[0.55em]">
      <p className="text-[0.86em] leading-snug text-foreground">Can I book a lesson this week?</p>
      <p className="mt-[0.2em] text-right text-[0.62em] text-muted-foreground">09:41</p>
    </div>
  ),

  pin: (
    <div className="flex items-center gap-[0.6em] rounded-[0.5em] border border-border bg-muted/40 px-[0.7em] py-[0.55em]">
      <MapPin className="h-[1em] w-[1em] shrink-0 text-primary" />
      <span className="text-[0.86em] leading-snug text-foreground">
        SW4 — 12 min from your 3pm
      </span>
    </div>
  ),

  diary: (
    <div className="flex items-center gap-[0.6em] rounded-[0.5em] bg-primary/10 px-[0.7em] py-[0.55em]">
      <Check className="h-[1em] w-[1em] shrink-0 text-primary" strokeWidth={3} />
      <span className="text-[0.86em] font-semibold text-primary">Thu — 4:00–5:00pm</span>
    </div>
  ),

  portal: (
    <div className="space-y-[0.35em] rounded-[0.5em] border border-border bg-muted/40 px-[0.7em] py-[0.55em]">
      <div className="flex items-center gap-[0.6em]">
        <span className="h-[0.4em] w-[0.4em] shrink-0 rounded-full bg-primary" />
        <span className="text-[0.8em] font-semibold text-foreground">Booking added</span>
        <span className="ml-auto text-[0.62em] text-muted-foreground">now</span>
      </div>
      <div className="flex items-center gap-[0.6em] opacity-45">
        <span className="h-[0.4em] w-[0.4em] shrink-0 rounded-full bg-muted-foreground" />
        <span className="text-[0.8em] font-medium text-foreground">Lesson moved</span>
        <span className="ml-auto text-[0.62em] text-muted-foreground">1h</span>
      </div>
    </div>
  ),
};

const StationCard = ({
  station,
  showIcon = false,
}: {
  station: Station;
  /** The road already carries the icon on its marker; the static list doesn't. */
  showIcon?: boolean;
}) => (
  <div className="rounded-[1em] border border-border bg-white p-[1.2em] shadow-elegant">
    <div className="flex items-center gap-[0.6em]">
      {showIcon && <StationIcon id={station.id} className="h-[1.2em] w-[1.2em] text-primary" />}
      <span className="text-[0.68em] font-bold uppercase tracking-[0.16em] text-primary">
        {station.step}
      </span>
      <span className="h-px flex-1 bg-primary/25" />
    </div>

    <h3 className="mt-[0.5em] text-[1.15em] font-bold leading-tight text-foreground">
      {station.title}
    </h3>

    <p className="mt-[0.4em] text-[0.95em] leading-snug text-muted-foreground">{station.body}</p>

    <div className="mt-[0.85em]">{VISUALS[station.id]}</div>
  </div>
);

export default StationCard;
