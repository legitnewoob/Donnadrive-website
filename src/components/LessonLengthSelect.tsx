import { formatDuration } from "@/lib/api";

// 30 minutes to 3 hours, in 15-minute steps
export const LESSON_LENGTHS = Array.from({ length: 11 }, (_, i) => 30 + i * 15);

/** A lesson length picker. Each active lesson type needs a different length. */
export default function LessonLengthSelect({
  value,
  onChange,
  taken = [],
  id,
  className = "",
  disabled,
  ariaLabel = "Lesson length",
}: {
  value: number | null;
  onChange: (minutes: number) => void;
  /** Lengths other active lesson types already use */
  taken?: number[];
  id?: string;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <select
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      {value == null && <option value="">Choose…</option>}
      {LESSON_LENGTHS.map((m) => (
        <option key={m} value={m} disabled={taken.includes(m) && m !== value}>
          {formatDuration(m)}
          {taken.includes(m) && m !== value ? " (used)" : ""}
        </option>
      ))}
    </select>
  );
}
