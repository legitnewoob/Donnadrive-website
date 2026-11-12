import { useMemo, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { AlertTriangle, ChevronDown, Copy, Eraser, Lock, MoreHorizontal, Plus, Wand2 } from "lucide-react";
import { formatDuration, type DayKey, type DaySlot } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Slots = Record<DayKey, DaySlot[]>;
type Break = { from: string; to: string };
export type SlotLength = { durationMin: number; name: string | null };

const DAYS: { key: DayKey; label: string; long: string }[] = [
  { key: "mon", label: "Mon", long: "Monday" },
  { key: "tue", label: "Tue", long: "Tuesday" },
  { key: "wed", label: "Wed", long: "Wednesday" },
  { key: "thu", label: "Thu", long: "Thursday" },
  { key: "fri", label: "Fri", long: "Friday" },
  { key: "sat", label: "Sat", long: "Saturday" },
  { key: "sun", label: "Sun", long: "Sunday" },
];

// Lesson lengths share one coral ramp: the longer the lesson, the deeper the shade.
// The length is always written on the slot too.
const RAMP = [
  "bg-[#FBC9B8] text-[#5F1D14]",
  "bg-coral-peach text-[#5F1D14]",
  "bg-primary text-white",
  "bg-[#C63D2B] text-white",
  "bg-[#8F2D1F] text-white",
  "bg-[#5F1D14] text-white",
];
const HATCH = "bg-[repeating-linear-gradient(135deg,#cbd5e1_0_4px,transparent_4px_8px)]";

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
// "2h", "1.5h", "45m": short enough for a narrow slot
const compact = (min: number) => (min < 60 ? `${min}m` : `${+(min / 60).toFixed(2)}h`);
const endOf = (s: DaySlot) => toMinutes(s.start) + s.durationMin;
const byStart = (a: DaySlot, b: DaySlot) => toMinutes(a.start) - toMinutes(b.start);
const validBreak = (b: Break) => !!b.from && !!b.to && b.from < b.to;
const breakOver = (s: DaySlot, breaks: Break[]) =>
  breaks.find((b) => validBreak(b) && toMinutes(s.start) < toMinutes(b.to) && endOf(s) > toMinutes(b.from));

// Why a slot can't go here, if it can't
function slotProblem(slot: DaySlot, others: DaySlot[], breaks: Break[]) {
  if (!slot.start) return "Choose a start time.";
  if (endOf(slot) > 24 * 60) return "That runs past midnight.";
  const clash = others.find((o) => toMinutes(slot.start) < endOf(o) && endOf(slot) > toMinutes(o.start));
  if (clash) return `Overlaps your ${clash.start}–${toTime(endOf(clash))} slot.`;
  const brk = breakOver(slot, breaks);
  if (brk) return `Runs into your ${brk.from}–${brk.to} break.`;
  return null;
}

// Slots of one length from start to finish, stepping over breaks
function fillDay(durationMin: number, from: string, to: string, gap: number, breaks: Break[]) {
  const out: DaySlot[] = [];
  let t = toMinutes(from);
  const finish = toMinutes(to);
  while (t + durationMin <= finish && out.length < 24) {
    const slot = { start: toTime(t), durationMin, exact: false };
    const brk = breakOver(slot, breaks);
    if (brk) {
      t = toMinutes(brk.to);
      continue;
    }
    out.push(slot);
    t += durationMin + gap;
  }
  return out;
}

type Panel =
  | { kind: "slot"; day: DayKey; index: number | null; draft: DaySlot; rect: DOMRect | null }
  | { kind: "fill"; day: DayKey; durationMin: number; from: string; to: string; gap: number }
  | { kind: "copy"; day: DayKey; to: DayKey[] };

/**
 * Fixed mode: the instructor lays out each day's lesson slots, each with its
 * own length. A timeline per day on wider screens, a list per day on phones.
 */
export default function SlotPlanner({
  slots,
  onChange,
  lengths,
  breaks,
}: {
  slots: Slots;
  onChange: (next: Slots) => void;
  /** Lengths of the active lesson types */
  lengths: SlotLength[];
  breaks: Break[];
}) {
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState<Panel | null>(null);
  const [openDay, setOpenDay] = useState<DayKey | null>(null);
  // Slots of a day that was switched off, so switching it back on restores them
  const stash = useRef<Partial<Slots>>({});
  const lastLength = useRef<number | null>(null);

  const allLengths = useMemo(
    () => [...new Set([...lengths.map((l) => l.durationMin), ...Object.values(slots).flatMap((d) => d.map((s) => s.durationMin))])].sort((a, b) => a - b),
    [lengths, slots]
  );
  // Spread the lengths in use across the ramp so neighbours are easy to tell apart
  const colorOf = (durationMin: number) => {
    const i = Math.max(0, allLengths.indexOf(durationMin));
    const step = allLengths.length <= 3 ? 2 : 1;
    return RAMP[Math.min(i * step, RAMP.length - 1)];
  };
  const nameOf = (durationMin: number) => lengths.find((l) => l.durationMin === durationMin)?.name ?? null;
  // A slot nobody can book: no lesson type fits it
  const unbookable = (s: DaySlot) =>
    lengths.length > 0 && !lengths.some((l) => (s.exact ? l.durationMin === s.durationMin : l.durationMin <= s.durationMin));

  // The hours every timeline shows: 7am to 9pm, wider if a slot needs it
  const allSlots = Object.values(slots).flat();
  const rangeStart = Math.min(7 * 60, ...allSlots.map((s) => Math.floor(toMinutes(s.start) / 60) * 60));
  const rangeEnd = Math.max(21 * 60, ...allSlots.map((s) => Math.ceil(endOf(s) / 60) * 60));
  const span = rangeEnd - rangeStart;
  const pct = (m: number) => `${((m - rangeStart) / span) * 100}%`;
  const hours = Array.from({ length: span / 60 + 1 }, (_, i) => rangeStart / 60 + i);

  const setDay = (day: DayKey, list: DaySlot[]) => onChange({ ...slots, [day]: [...list].sort(byStart) });

  function toggleDay(day: DayKey, on: boolean) {
    if (!on) {
      stash.current[day] = slots[day];
      return setDay(day, []);
    }
    const other = DAYS.map((d) => slots[d.key]).find((l) => l.length);
    setDay(day, stash.current[day]?.length ? stash.current[day]! : other ? other.map((s) => ({ ...s })) : fillDay(lengths[0]?.durationMin ?? 60, "09:00", "17:00", 15, breaks));
  }

  // A new slot at a given time: the last length used if it fits, else the longest that does
  function draftAt(day: DayKey, start: number): DaySlot {
    const options = [lastLength.current, ...lengths.map((l) => l.durationMin).sort((a, b) => b - a)].filter((l): l is number => !!l);
    const fits = options.find((l) => !slotProblem({ start: toTime(start), durationMin: l, exact: false }, slots[day], breaks));
    return { start: toTime(start), durationMin: fits ?? options[options.length - 1] ?? 60, exact: false };
  }

  function addAfterLast(day: DayKey, rect: DOMRect | null = null) {
    const last = slots[day][slots[day].length - 1];
    let start = last ? endOf(last) + 15 : 9 * 60;
    const brk = breakOver({ start: toTime(start), durationMin: 30, exact: false }, breaks);
    if (brk) start = toMinutes(brk.to);
    setPanel({ kind: "slot", day, index: null, draft: draftAt(day, Math.min(start, 23 * 60)), rect });
  }

  function addAtClick(day: DayKey, e: React.MouseEvent<HTMLDivElement>) {
    if (e.target !== e.currentTarget) return;
    const box = e.currentTarget.getBoundingClientRect();
    const minute = rangeStart + ((e.clientX - box.left) / box.width) * span;
    const start = Math.max(rangeStart, Math.min(Math.round(minute / 15) * 15, rangeEnd - 30));
    const rect = new DOMRect(e.clientX, box.top, 0, box.height);
    setPanel({ kind: "slot", day, index: null, draft: draftAt(day, start), rect });
  }

  function saveSlot(p: Extract<Panel, { kind: "slot" }>) {
    const list = slots[p.day].filter((_, i) => i !== p.index);
    lastLength.current = p.draft.durationMin;
    setDay(p.day, [...list, p.draft]);
    setPanel(null);
  }

  const summary = (list: DaySlot[]) => {
    if (!list.length) return "Day off";
    const teaching = list.reduce((sum, s) => sum + s.durationMin, 0);
    return `${list.length} slot${list.length === 1 ? "" : "s"} · ${formatDuration(teaching)}`;
  };

  const clashes = DAYS.flatMap((d) => slots[d.key].filter((s) => breakOver(s, breaks)).map((s) => ({ day: d, slot: s })));

  const dayMenu = (day: DayKey) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`More for ${DAYS.find((d) => d.key === day)!.long}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => {
            const list = slots[day];
            setPanel({
              kind: "fill",
              day,
              durationMin: lengths[0]?.durationMin ?? 60,
              from: list[0]?.start ?? "09:00",
              to: toTime(Math.max(17 * 60, ...list.map(endOf))),
              gap: 15,
            });
          }}
        >
          <Wand2 className="mr-2 h-4 w-4" /> Fill the day…
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!slots[day].length} onSelect={() => setPanel({ kind: "copy", day, to: [] })}>
          <Copy className="mr-2 h-4 w-4" /> Copy to other days…
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!slots[day].length} onSelect={() => toggleDay(day, false)}>
          <Eraser className="mr-2 h-4 w-4" /> Clear the day
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-3">
      {/* Wider screens: a timeline per day */}
      <div className="hidden md:block">
        <div className="flex items-end gap-3 pb-1">
          <div className="w-[5.5rem] shrink-0" />
          <div className="relative h-4 min-w-0 flex-1 text-[10px] text-slate-400" aria-hidden>
            {hours.map((h, i) => (
              <span key={h} className={`absolute ${i === 0 ? "" : i === hours.length - 1 ? "-translate-x-full" : "-translate-x-1/2"} ${i % 2 ? "hidden xl:inline" : ""}`} style={{ left: pct(h * 60) }}>
                {h % 12 || 12}
                {h < 12 ? "am" : "pm"}
              </span>
            ))}
          </div>
          <div className="w-40 shrink-0" />
        </div>
        <div className="space-y-1.5">
          {DAYS.map(({ key, label, long }) => {
            const list = slots[key];
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="flex w-[5.5rem] shrink-0 items-center gap-2">
                  <Switch checked={list.length > 0} onCheckedChange={(on) => toggleDay(key, on)} aria-label={`Work on ${long}`} />
                  <span className={`text-sm font-medium ${list.length ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                </div>
                <div
                  onClick={(e) => addAtClick(key, e)}
                  title="Click an empty space to add a slot"
                  className="relative h-10 min-w-0 flex-1 cursor-copy overflow-hidden rounded-md border bg-slate-50 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px)]"
                  style={{ backgroundSize: `${(60 / span) * 100}% 100%` }}
                >
                  {breaks.filter(validBreak).map((b, i) => (
                    <div
                      key={i}
                      className={`pointer-events-none absolute inset-y-0 ${HATCH}`}
                      style={{ left: pct(toMinutes(b.from)), width: `${((toMinutes(b.to) - toMinutes(b.from)) / span) * 100}%` }}
                      title={`Break ${b.from}–${b.to}`}
                    />
                  ))}
                  {list.map((s, i) => {
                    const warn = breakOver(s, breaks) ? "overlaps a break" : unbookable(s) ? "no lesson type fits" : null;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        onClick={(e) => setPanel({ kind: "slot", day: key, index: i, draft: { ...s }, rect: e.currentTarget.getBoundingClientRect() })}
                        aria-label={`${long} ${s.start} to ${toTime(endOf(s))}, ${formatDuration(s.durationMin)}${s.exact ? ", this length only" : ""}${warn ? `, ${warn}` : ""}. Edit`}
                        title={`${s.start}–${toTime(endOf(s))} · ${formatDuration(s.durationMin)}${nameOf(s.durationMin) ? ` · ${nameOf(s.durationMin)}` : ""}${warn ? ` · ${warn}` : ""}`}
                        className={`absolute inset-y-1 flex items-center justify-center gap-0.5 overflow-hidden rounded px-0.5 text-[11px] font-semibold leading-none outline-offset-1 transition-[filter] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900 ${colorOf(s.durationMin)} ${warn ? "ring-2 ring-inset ring-amber-300" : ""}`}
                        style={{ left: pct(toMinutes(s.start)), width: `calc(${(s.durationMin / span) * 100}% - 2px)` }}
                      >
                        {warn ? <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden /> : s.exact && <Lock className="h-3 w-3 shrink-0" aria-hidden />}
                        <span className="truncate">{compact(s.durationMin)}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex w-40 shrink-0 items-center justify-end gap-0.5">
                  <span className="min-w-0 flex-1 truncate text-right text-xs text-slate-500">{summary(list)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    aria-label={`Add a slot on ${long}`}
                    onClick={(e) => addAfterLast(key, e.currentTarget.getBoundingClientRect())}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {dayMenu(key)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phones: a list per day */}
      <div className="space-y-2 md:hidden">
        {DAYS.map(({ key, label, long }) => {
          const list = slots[key];
          const open = openDay === key;
          const warnings = list.filter((s) => breakOver(s, breaks) || unbookable(s)).length;
          return (
            <div key={key} className="rounded-lg border bg-white">
              <div className="flex items-center gap-3 px-3 py-2">
                <Switch checked={list.length > 0} onCheckedChange={(on) => (toggleDay(key, on), on && setOpenDay(key))} aria-label={`Work on ${long}`} />
                <button type="button" onClick={() => setOpenDay(open ? null : key)} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left">
                  <span className={`w-9 shrink-0 text-sm font-medium ${list.length ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                  <span className={`min-w-0 flex-1 truncate text-sm ${list.length ? "text-slate-600" : "text-slate-400"}`}>
                    {list.length ? `${list[0].start} – ${toTime(Math.max(...list.map(endOf)))} · ${list.length} slot${list.length === 1 ? "" : "s"}` : "Day off"}
                  </span>
                  {warnings > 0 && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                      ⚠ {warnings}
                      <span className="sr-only"> slot{warnings === 1 ? "" : "s"} need a look</span>
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              </div>
              {open && (
                <div className="space-y-2 border-t px-3 py-3">
                  {list.map((s, i) => {
                    const warn = breakOver(s, breaks) ? "Overlaps a break" : unbookable(s) ? "No lesson type fits" : null;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setPanel({ kind: "slot", day: key, index: i, draft: { ...s }, rect: null })}
                        className="flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left"
                      >
                        <span className={`h-9 w-1.5 shrink-0 rounded-full ${colorOf(s.durationMin)}`} aria-hidden />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-slate-800">
                            {s.start} – {toTime(endOf(s))}
                          </span>
                          <span className={`block truncate text-xs ${warn ? "text-amber-700" : "text-slate-500"}`}>
                            {formatDuration(s.durationMin)}
                            {nameOf(s.durationMin) ? ` · ${nameOf(s.durationMin)}` : ""}
                            {s.exact ? " · this length only" : ""}
                            {warn ? ` · ${warn}` : ""}
                          </span>
                        </span>
                        {warn ? <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden /> : s.exact && <Lock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />}
                      </button>
                    );
                  })}
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => addAfterLast(key)}>
                      <Plus className="mr-1 h-4 w-4" /> Add slot
                    </Button>
                    {dayMenu(key)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Key */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
        {allLengths.map((l) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-4 rounded-sm ${colorOf(l)}`} /> {formatDuration(l)}
            {nameOf(l) ? ` ${nameOf(l)}` : ""}
          </span>
        ))}
        {breaks.some(validBreak) && (
          <span className="flex items-center gap-1.5">
            <span className={`h-2.5 w-4 rounded-sm ${HATCH}`} /> Break
          </span>
        )}
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" aria-hidden /> This length only
        </span>
      </div>

      {clashes.length > 0 && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="min-w-0 space-y-2">
            <p className="font-medium text-amber-900">
              {clashes.length} slot{clashes.length === 1 ? " overlaps" : "s overlap"} your breaks
            </p>
            <p className="text-amber-800">
              {clashes.slice(0, 4).map((c) => `${c.day.label} ${c.slot.start}`).join(", ")}
              {clashes.length > 4 ? ` and ${clashes.length - 4} more` : ""}. Donna won't offer a lesson that runs into a break.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 bg-white"
              onClick={() => onChange(Object.fromEntries(DAYS.map((d) => [d.key, slots[d.key].filter((s) => !breakOver(s, breaks))])) as Slots)}
            >
              Remove these slots
            </Button>
          </div>
        </div>
      )}

      {panel?.kind === "slot" && (
        <PanelShell
          title={`${panel.index === null ? "Add a slot" : "Edit slot"} · ${DAYS.find((d) => d.key === panel.day)!.long}`}
          rect={panel.rect}
          mobile={isMobile}
          onClose={() => setPanel(null)}
        >
          <SlotForm
            panel={panel}
            others={slots[panel.day].filter((_, i) => i !== panel.index)}
            lengths={lengths}
            breaks={breaks}
            colorOf={colorOf}
            onDraft={(draft) => setPanel({ ...panel, draft })}
            onSave={() => saveSlot(panel)}
            onRemove={() => {
              setDay(panel.day, slots[panel.day].filter((_, i) => i !== panel.index));
              setPanel(null);
            }}
            onCancel={() => setPanel(null)}
          />
        </PanelShell>
      )}

      {panel?.kind === "fill" && (
        <PanelShell title={`Fill ${DAYS.find((d) => d.key === panel.day)!.long}`} rect={null} mobile={isMobile} onClose={() => setPanel(null)}>
          <FillForm
            panel={panel}
            lengths={lengths}
            breaks={breaks}
            replaces={slots[panel.day].length}
            onChange={setPanel}
            onApply={(list) => {
              setDay(panel.day, list);
              setPanel(null);
            }}
            onCancel={() => setPanel(null)}
          />
        </PanelShell>
      )}

      {panel?.kind === "copy" && (
        <PanelShell title={`Copy ${DAYS.find((d) => d.key === panel.day)!.long} to…`} rect={null} mobile={isMobile} onClose={() => setPanel(null)}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DAYS.filter((d) => d.key !== panel.day).map((d) => {
                const on = panel.to.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPanel({ ...panel, to: on ? panel.to.filter((k) => k !== d.key) : [...panel.to, d.key] })}
                    className={`rounded-md border px-3 py-2 text-sm transition-colors ${on ? "border-primary bg-primary text-white" : "bg-white text-slate-600 hover:border-slate-400"}`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="text-sm font-medium text-coral-deep hover:underline"
              onClick={() => setPanel({ ...panel, to: (["mon", "tue", "wed", "thu", "fri"] as DayKey[]).filter((k) => k !== panel.day) })}
            >
              Choose all weekdays
            </button>
            <p className="text-xs text-slate-500">This replaces the slots already on those days.</p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPanel(null)}>
                Cancel
              </Button>
              <Button
                disabled={!panel.to.length}
                onClick={() => {
                  onChange({ ...slots, ...Object.fromEntries(panel.to.map((k) => [k, slots[panel.day].map((s) => ({ ...s }))])) });
                  setPanel(null);
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        </PanelShell>
      )}
    </div>
  );
}

// A bottom sheet on phones; on wider screens a popover beside what was clicked, or a dialog
function PanelShell({
  title,
  rect,
  mobile,
  onClose,
  children,
}: {
  title: string;
  rect: DOMRect | null;
  mobile: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const onOpenChange = (open: boolean) => !open && onClose();
  if (mobile) {
    return (
      <Drawer open onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{children}</div>
        </DrawerContent>
      </Drawer>
    );
  }
  if (rect) {
    return (
      <Popover open onOpenChange={onOpenChange}>
        <PopoverPrimitive.Anchor virtualRef={{ current: { getBoundingClientRect: () => rect } }} />
        <PopoverContent className="w-80 space-y-3" align="start" collisionPadding={12}>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {children}
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function LengthButtons({
  value,
  lengths,
  colorOf,
  disabledReason,
  onChange,
}: {
  value: number;
  lengths: SlotLength[];
  colorOf?: (m: number) => string;
  disabledReason?: (m: number) => string | null;
  onChange: (m: number) => void;
}) {
  // A slot whose length no lesson type uses any more still shows its own length
  const options = lengths.some((l) => l.durationMin === value) ? lengths : [...lengths, { durationMin: value, name: null }];
  return (
    <div className="grid grid-cols-3 gap-2">
      {[...options].sort((a, b) => a.durationMin - b.durationMin).map((l) => {
        const on = l.durationMin === value;
        const reason = disabledReason?.(l.durationMin) ?? null;
        return (
          <button
            key={l.durationMin}
            type="button"
            aria-pressed={on}
            disabled={!!reason && !on}
            title={reason ?? undefined}
            onClick={() => onChange(l.durationMin)}
            className={`rounded-lg border-2 px-2 py-2 text-center transition-colors disabled:opacity-40 ${on ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <span className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-900">
              {colorOf && <span className={`h-2.5 w-2.5 rounded-sm ${colorOf(l.durationMin)}`} aria-hidden />}
              {formatDuration(l.durationMin)}
            </span>
            <span className="block truncate text-[11px] text-slate-500">{l.name ?? "No lesson type"}</span>
          </button>
        );
      })}
    </div>
  );
}

function SlotForm({
  panel,
  others,
  lengths,
  breaks,
  colorOf,
  onDraft,
  onSave,
  onRemove,
  onCancel,
}: {
  panel: Extract<Panel, { kind: "slot" }>;
  others: DaySlot[];
  lengths: SlotLength[];
  breaks: Break[];
  colorOf: (m: number) => string;
  onDraft: (draft: DaySlot) => void;
  onSave: () => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const { draft } = panel;
  const problem = slotProblem(draft, others, breaks);
  const shorter = lengths.filter((l) => l.durationMin < draft.durationMin);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!problem) onSave();
      }}
    >
      <div className="flex items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="slot-start">Starts</Label>
          <Input id="slot-start" type="time" step={300} value={draft.start} onChange={(e) => onDraft({ ...draft, start: e.target.value })} className="w-32 text-base sm:text-sm" />
        </div>
        {draft.start && <p className="pb-2.5 text-sm text-slate-500">ends {toTime(Math.min(endOf(draft), 24 * 60 - 1))}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Length</Label>
        <LengthButtons
          value={draft.durationMin}
          lengths={lengths}
          colorOf={colorOf}
          disabledReason={(m) => (draft.start ? slotProblem({ ...draft, durationMin: m }, others, breaks) : null)}
          onChange={(durationMin) => onDraft({ ...draft, durationMin })}
        />
      </div>
      {shorter.length > 0 && (
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="slot-exact">Only {formatDuration(draft.durationMin)} lessons</Label>
            <p className="text-xs text-slate-500">
              {draft.exact
                ? "Donna keeps this slot for this length."
                : `Donna can also offer it for a ${shorter.map((l) => formatDuration(l.durationMin)).join(" or ")} lesson.`}
            </p>
          </div>
          <Switch id="slot-exact" checked={draft.exact} onCheckedChange={(exact) => onDraft({ ...draft, exact })} />
        </div>
      )}
      {problem && (
        <p role="alert" className="text-sm text-red-600">
          {problem}
        </p>
      )}
      <div className="flex items-center gap-2">
        {panel.index !== null && (
          <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700" onClick={onRemove}>
            Remove
          </Button>
        )}
        <span className="flex-1" />
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!!problem}>
          {panel.index === null ? "Add slot" : "Done"}
        </Button>
      </div>
    </form>
  );
}

function FillForm({
  panel,
  lengths,
  breaks,
  replaces,
  onChange,
  onApply,
  onCancel,
}: {
  panel: Extract<Panel, { kind: "fill" }>;
  lengths: SlotLength[];
  breaks: Break[];
  replaces: number;
  onChange: (p: Panel) => void;
  onApply: (list: DaySlot[]) => void;
  onCancel: () => void;
}) {
  const valid = !!panel.from && !!panel.to && panel.from < panel.to;
  const result = valid ? fillDay(panel.durationMin, panel.from, panel.to, panel.gap, breaks) : [];
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Lesson length</Label>
        <LengthButtons value={panel.durationMin} lengths={lengths} onChange={(durationMin) => onChange({ ...panel, durationMin })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fill-from">First start</Label>
          <Input id="fill-from" type="time" step={300} value={panel.from} onChange={(e) => onChange({ ...panel, from: e.target.value })} className="text-base sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fill-to">Finish by</Label>
          <Input id="fill-to" type="time" step={300} value={panel.to} onChange={(e) => onChange({ ...panel, to: e.target.value })} className="text-base sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fill-gap">Gap</Label>
          <select
            id="fill-gap"
            value={panel.gap}
            onChange={(e) => onChange({ ...panel, gap: Number(e.target.value) })}
            className="h-10 w-full rounded-md border bg-white px-2 text-base sm:text-sm"
          >
            {[0, 5, 10, 15, 20, 30, 45, 60].map((g) => (
              <option key={g} value={g}>
                {g ? `${g} min` : "None"}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-600" aria-live="polite">
        {result.length ? (
          <>
            <span className="font-semibold text-slate-900">
              {result.length} slot{result.length === 1 ? "" : "s"}:
            </span>{" "}
            {result.map((s) => s.start).join(", ")}
          </>
        ) : (
          "Nothing fits between those times."
        )}
      </p>
      {replaces > 0 && <p className="text-xs text-slate-500">This replaces the {replaces} slot{replaces === 1 ? "" : "s"} already on this day. You can add other lengths afterwards.</p>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!result.length} onClick={() => onApply(result)}>
          Fill the day
        </Button>
      </div>
    </div>
  );
}
