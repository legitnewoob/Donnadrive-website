import { useEffect, useState } from "react";

import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

import RoadJourney from "./RoadJourney";
import StaticSteps from "./StaticSteps";

/** The scrubbed road needs both the width to lay the journey out across and
 *  a user who hasn't asked for less motion; everything else gets the list. */
const ROAD_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

const useRoadEnabled = () => {
  const [enabled, setEnabled] = useState(
    () => typeof window !== "undefined" && window.matchMedia(ROAD_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(ROAD_QUERY);
    const onChange = () => setEnabled(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return enabled;
};

const HowDonnaWorks = () => {
  const roadEnabled = useRoadEnabled();

  return (
    // No overflow-hidden here: the road is pinned with position: fixed, and
    // clipping/transforming an ancestor is what breaks ScrollTrigger pins.
    // The map img is self-contained (inset-0/w-full/h-full) so it doesn't
    // need one either.
    <section
      id="how-donna-works"
      className="relative scroll-mt-28 bg-gradient-to-b from-orange-50/30 to-orange-50/20"
    >
      <RoundaboutMapBackground />

      {/* The map is absolutely positioned, so it would paint over static
          content — this keeps the journey above it. `relative` is safe for
          the pin: only transform/filter/perspective on an ancestor would
          break position: fixed. */}
      <div className="relative">{roadEnabled ? <RoadJourney /> : <StaticSteps />}</div>
    </section>
  );
};

export default HowDonnaWorks;
