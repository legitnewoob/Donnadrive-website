/**
 * `compact` is for the pinned road: the journey needs the screen height
 * more than the heading does, so it drops a size and loses the sub-line's
 * breathing room rather than squeezing the road.
 */
const SectionHeading = ({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) => (
  <div className={`text-center ${className}`}>
    <h2
      className={`font-black tracking-tight text-foreground ${
        compact ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl"
      }`}
    >
      How{" "}
      <span className="underline decoration-primary decoration-[6px] underline-offset-4">
        Donna
      </span>{" "}
      works
    </h2>

    <p
      className={`mx-auto max-w-xl text-muted-foreground ${
        compact ? "mt-2 text-base" : "mt-4 text-lg leading-8"
      }`}
    >
      One learner message, handled end to end — while you're teaching.
    </p>
  </div>
);

export default SectionHeading;
