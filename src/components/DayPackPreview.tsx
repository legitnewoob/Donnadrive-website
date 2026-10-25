import { Loader2 } from "lucide-react";
import { formatDuration, type DayPreview } from "@/lib/api";
import { packingColor } from "@/components/PackingSlider";

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const to12h = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
};

/**
 * One row per lesson length: the day as Donna would pack it if every drive
 * took the full gap. Lessons, drives and lunch are drawn to scale.
 */
export default function DayPackPreview({
  preview,
  loading,
  bufferMin,
}: {
  preview: DayPreview | null;
  loading: boolean;
  bufferMin: number;
}) {
  if (!preview) {
    return (
      <div className="flex h-24 items-center justify-center rounded-lg border border-dashed text-sm text-slate-400">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set your hours to see your day"}
      </div>
    );
  }

  const start = toMinutes(preview.dayHours.start);
  const end = toMinutes(preview.dayHours.end);
  const span = Math.max(1, end - start);
  const pos = (m: number) => `${((m - start) / span) * 100}%`;
  const width = (m: number) => `${(m / span) * 100}%`;
  const lessonColor = packingColor(bufferMin);

  return (
    <div className={`space-y-3 transition-opacity ${loading ? "opacity-60" : ""}`} aria-live="polite">
      {preview.days.map((day) => (
        <div key={day.durationMin} className="space-y-1">
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="font-medium text-slate-800">
              {day.name ? `${day.name} · ` : ""}
              {formatDuration(day.durationMin)} lessons
            </span>
            <span className="shrink-0 text-slate-600">
              <span className="text-base font-semibold text-slate-900">{day.count}</span> a day
            </span>
          </div>
          <div className="relative h-7 overflow-hidden rounded-md bg-slate-100" role="img"
            aria-label={`${day.count} ${formatDuration(day.durationMin)} lessons${day.lunch ? `, lunch ${day.lunch.from} to ${day.lunch.to}` : ""}`}>
            {day.starts.map((s, i) => {
              const from = toMinutes(s);
              const next = day.starts[i + 1] ? toMinutes(day.starts[i + 1]) : null;
              const lessonEnd = from + day.durationMin;
              const lunchAfter = day.lunch && toMinutes(day.lunch.from) >= lessonEnd && (!next || toMinutes(day.lunch.to) <= next);
              const driveFrom = lunchAfter ? toMinutes(day.lunch!.to) : lessonEnd;
              return (
                <div key={s}>
                  <div
                    className="absolute inset-y-0 rounded-sm border-r border-white/60 transition-[background-color] duration-200"
                    style={{ left: pos(from), width: width(day.durationMin), backgroundColor: lessonColor }}
                    title={`${to12h(s)} lesson`}
                  />
                  {next !== null && next > driveFrom && (
                    <div
                      className="absolute inset-y-1.5 rounded-sm bg-[repeating-linear-gradient(135deg,#cbd5e1_0_4px,transparent_4px_8px)]"
                      style={{ left: pos(driveFrom), width: width(next - driveFrom) }}
                      title="Driving"
                    />
                  )}
                </div>
              );
            })}
            {day.lunch && (
              <div
                className="absolute inset-y-0 flex items-center justify-center rounded-sm bg-amber-300 text-[10px] font-semibold text-amber-900"
                style={{ left: pos(toMinutes(day.lunch.from)), width: width(toMinutes(day.lunch.to) - toMinutes(day.lunch.from)) }}
                title={`Lunch ${day.lunch.from}–${day.lunch.to}`}
              >
                <span className="hidden sm:inline">Lunch</span>
              </div>
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {day.starts.length ? day.starts.map(to12h).join(", ") : "No lessons fit"}
            {day.lunch ? ` · lunch ${to12h(day.lunch.from)}` : ""}
          </p>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm" style={{ backgroundColor: lessonColor }} /> Lesson
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-[repeating-linear-gradient(135deg,#cbd5e1_0_4px,transparent_4px_8px)]" /> About {bufferMin} min driving
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-amber-300" /> Lunch
        </span>
      </div>
      <p className="text-xs text-slate-500">
        A typical day: it assumes every drive takes about {bufferMin} minutes. When learners live close together she fits in
        more; a learner further out takes a longer gap.
      </p>
    </div>
  );
}
