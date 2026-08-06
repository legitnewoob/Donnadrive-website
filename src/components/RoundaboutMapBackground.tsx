import roundaboutMap from "@/assets/roundabout-map.png";

/**
 * The faint roundabout map introduced behind the mascot in MeetDonna,
 * reused here so it reads as one constant backdrop running underneath
 * every section that follows rather than a one-off decoration.
 */
const RoundaboutMapBackground = () => (
  <img
    src={roundaboutMap}
    alt=""
    aria-hidden="true"
    className="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none"
  />
);

export default RoundaboutMapBackground;
