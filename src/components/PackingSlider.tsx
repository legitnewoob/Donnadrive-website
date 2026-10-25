import * as SliderPrimitive from "@radix-ui/react-slider";

export const PACKING_MIN = 12;
export const PACKING_MAX = 45;

const BANDS = [
  { upTo: 17, label: "Back-to-back" },
  { upTo: 24, label: "Snug" },
  { upTo: 34, label: "Balanced" },
  { upTo: PACKING_MAX, label: "Relaxed" },
];

export function packingLabel(minutes: number) {
  return (BANDS.find((b) => minutes <= b.upTo) ?? BANDS[BANDS.length - 1]).label;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Coral-red when lessons are packed back-to-back, through amber, to green
 * when there's plenty of room to drive. Changes smoothly with every minute.
 */
export function packingColor(minutes: number, lightness = 46) {
  const t = Math.min(1, Math.max(0, (minutes - PACKING_MIN) / (PACKING_MAX - PACKING_MIN)));
  const hue = t < 0.36 ? lerp(4, 40, t / 0.36) : lerp(40, 145, (t - 0.36) / 0.64);
  const sat = t < 0.36 ? 82 : lerp(82, 60, (t - 0.36) / 0.64);
  return `hsl(${hue.toFixed(1)} ${sat.toFixed(0)}% ${lightness}%)`;
}

// The longest drive between lessons: 12 to 60 minutes
export const DRIVE_MIN = 12;
export const DRIVE_MAX = 60;

const DRIVE_BANDS = [
  { upTo: 20, label: "Local only" },
  { upTo: 30, label: "Nearby towns" },
  { upTo: 45, label: "Wider area" },
  { upTo: DRIVE_MAX, label: "Up to an hour" },
];

export function driveLabel(minutes: number) {
  return (DRIVE_BANDS.find((b) => minutes <= b.upTo) ?? DRIVE_BANDS[DRIVE_BANDS.length - 1]).label;
}

/** Teal for a small local area, through sky blue, to violet for a wide one. */
export function driveColor(minutes: number, lightness = 46) {
  const t = Math.min(1, Math.max(0, (minutes - DRIVE_MIN) / (DRIVE_MAX - DRIVE_MIN)));
  const hue = lerp(170, 265, t);
  const sat = lerp(70, 62, t);
  return `hsl(${hue.toFixed(1)} ${sat.toFixed(0)}% ${lightness}%)`;
}

/** "What's the longest you'll drive between lessons?" */
export default function PackingSlider({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}) {
  const color = driveColor(value);
  const pct = ((value - DRIVE_MIN) / (DRIVE_MAX - DRIVE_MIN)) * 100;
  const label = driveLabel(value);

  return (
    <div className="space-y-2 pt-9">
      <SliderPrimitive.Root
        value={[value]}
        min={DRIVE_MIN}
        max={DRIVE_MAX}
        step={1}
        disabled={disabled}
        onValueChange={([v]) => onChange(v)}
        aria-label="Longest drive between lessons"
        className="relative flex w-full touch-none select-none items-center py-2"
      >
        <SliderPrimitive.Track
          className="relative h-2.5 w-full grow overflow-hidden rounded-full"
          style={{
            background: `linear-gradient(to right, ${driveColor(DRIVE_MIN, 88)}, ${driveColor(36, 88)}, ${driveColor(DRIVE_MAX, 88)})`,
          }}
        >
          <SliderPrimitive.Range
            className="absolute h-full rounded-full transition-[background-color] duration-200"
            style={{ backgroundColor: color }}
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          aria-valuetext={`${value} minutes, ${label}`}
          className="relative block h-6 w-6 rounded-full border-[3px] bg-white shadow-md transition-[border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ borderColor: color, ["--tw-ring-color" as string]: color }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm transition-[background-color] duration-200"
            style={{
              backgroundColor: color,
              // Centred over the thumb, sliding towards the inside at either end so it stays in the card
              transform: `translateX(-${6 + (88 * pct) / 100}%)`,
            }}
          >
            {value} min · {label}
          </span>
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Stay local</span>
        <span>Go further</span>
      </div>
    </div>
  );
}
