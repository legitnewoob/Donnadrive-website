import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, X, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateLearnerPreferences, type SchedulingPrefs } from "@/lib/api";

const DAYS = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 0, label: "Sun" },
];
const HOURLY = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

function DayChips({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-1">
      {DAYS.map((d) => (
        <button
          key={d.n}
          type="button"
          onClick={() => onChange(toggle(value, d.n).sort())}
          className={`px-2 py-1 text-xs rounded-md border ${
            value.includes(d.n) ? "bg-sky-600 border-sky-600 text-white" : "bg-white text-slate-500 hover:border-slate-400"
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

export default function LearnerScheduling({
  token,
  phone,
  initial,
  lessonTypes,
  onSaved,
}: {
  token: string;
  phone: string;
  initial: SchedulingPrefs;
  lessonTypes: Array<{ _id: string; name: string; price: number; active: boolean }>;
  onSaved: (prefs: SchedulingPrefs) => void;
}) {
  const [saved, setSaved] = useState(initial);
  const [prefs, setPrefs] = useState(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SchedulingPrefs>(key: K, value: SchedulingPrefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const strip = (p: SchedulingPrefs) => ({
    ...p,
    savedPlaces: p.savedPlaces.map(({ label, address }) => ({ label, address })),
  });
  const dirty = !same(strip(prefs), strip(saved));

  async function save() {
    setSaving(true);
    try {
      const body = strip(prefs);
      const next = await updateLearnerPreferences(token, phone, {
        ...body,
        savedPlaces: body.savedPlaces.filter((p) => p.label.trim() && p.address.trim()),
      });
      setSaved(next);
      setPrefs(next);
      onSaved(next);
      toast.success("Scheduling preferences saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Priority learner</p>
          <p className="text-xs text-slate-500">Offer every slot you can reach, however far. Useful before a test.</p>
        </div>
        <Switch checked={prefs.priority} onCheckedChange={(v) => set("priority", v)} />
      </div>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-800">Pause Donna for this learner</p>
          <p className="text-xs text-slate-500">Donna won't reply to them; you'll get an email when they message.</p>
        </div>
        <Switch checked={prefs.donnaPaused} onCheckedChange={(v) => set("donnaPaused", v)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Max extra driving (min)</label>
          <Input
            type="number"
            min={5}
            max={120}
            value={prefs.maxAddedDriveMin ?? ""}
            onChange={(e) => set("maxAddedDriveMin", numOrNull(e.target.value))}
            placeholder="Your setting"
            disabled={prefs.priority}
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Max lessons per week</label>
          <Input
            type="number"
            min={1}
            max={14}
            value={prefs.maxLessonsPerWeek ?? ""}
            onChange={(e) => set("maxLessonsPerWeek", numOrNull(e.target.value))}
            placeholder="No limit"
            className="h-9"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">Default lesson type</label>
        <select
          value={prefs.defaultLessonTypeId ?? ""}
          onChange={(e) => set("defaultLessonTypeId", e.target.value || null)}
          className="h-9 w-full rounded-md border bg-white px-2 text-sm"
        >
          <option value="">None</option>
          {lessonTypes
            .filter((t) => t.active || t._id === prefs.defaultLessonTypeId)
            .map((t) => (
              <option key={t._id} value={t._id}>
                {t.name} (£{t.price})
              </option>
            ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">Saved pickup places</label>
        <p className="text-xs text-slate-500">Donna offers these by name and uses them to plan your route.</p>
        {prefs.savedPlaces.map((p, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border p-2 sm:flex sm:border-0 sm:p-0">
            <Input
              value={p.label}
              maxLength={30}
              onChange={(e) =>
                set("savedPlaces", prefs.savedPlaces.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
              }
              placeholder="Name, e.g. College"
              className="h-9 sm:w-32"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:order-last" aria-label="Remove place" onClick={() => set("savedPlaces", prefs.savedPlaces.filter((_, j) => j !== i))}>
              <X className="h-4 w-4" />
            </Button>
            <Input
              value={p.address}
              maxLength={200}
              onChange={(e) =>
                set("savedPlaces", prefs.savedPlaces.map((x, j) => (j === i ? { ...x, address: e.target.value, located: false } : x)))
              }
              placeholder="Address or postcode"
              className="h-9 sm:flex-1"
            />
            <span className="flex h-8 w-8 items-center justify-center sm:w-auto">
              {p.located ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" aria-label="Found on the map" />
              ) : (
                <MapPin className="h-4 w-4 text-slate-300 shrink-0" aria-label="Will be looked up when saved" />
              )}
            </span>
          </div>
        ))}
        {prefs.savedPlaces.length < 5 && (
          <Button variant="outline" size="sm" onClick={() => set("savedPlaces", [...prefs.savedPlaces, { label: "", address: "" }])}>
            <Plus className="h-4 w-4 mr-1" /> Add place
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">Usual days and times</label>
        <p className="text-xs text-slate-500">Donna mentions these first when they're free.</p>
        <DayChips value={prefs.preferredDays} onChange={(v) => set("preferredDays", v)} />
        <div className="flex flex-wrap gap-1">
          {HOURLY.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("preferredTimes", toggle(prefs.preferredTimes, t).sort())}
              className={`px-2 py-1 text-xs rounded-md border ${
                prefs.preferredTimes.includes(t) ? "bg-sky-600 border-sky-600 text-white" : "bg-white text-slate-500 hover:border-slate-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-700">Times they can't do</label>
        <p className="text-xs text-slate-500">Donna never offers these, e.g. school hours.</p>
        {prefs.unavailable.map((u, i) => (
          <div key={i} className="space-y-1.5 rounded-md border p-2">
            <div className="flex items-start justify-between gap-2">
              <DayChips
                value={u.days}
                onChange={(days) => set("unavailable", prefs.unavailable.map((x, j) => (j === i ? { ...x, days } : x)))}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Remove rule" onClick={() => set("unavailable", prefs.unavailable.filter((_, j) => j !== i))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={u.from}
                onChange={(e) => set("unavailable", prefs.unavailable.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))}
                className="h-9 min-w-0 flex-1 sm:w-28 sm:flex-none"
              />
              <span className="text-xs text-slate-400">to</span>
              <Input
                type="time"
                value={u.to}
                onChange={(e) => set("unavailable", prefs.unavailable.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))}
                className="h-9 min-w-0 flex-1 sm:w-28 sm:flex-none"
              />
            </div>
          </div>
        ))}
        {prefs.unavailable.length < 10 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => set("unavailable", [...prefs.unavailable, { days: [1, 2, 3, 4, 5], from: "09:00", to: "15:00" }])}
          >
            <Plus className="h-4 w-4 mr-1" /> Add rule
          </Button>
        )}
      </div>

      <div className="flex justify-end gap-2 border-t pt-3">
        {dirty && (
          <Button variant="ghost" size="sm" onClick={() => setPrefs(saved)} disabled={saving}>
            Discard
          </Button>
        )}
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save
        </Button>
      </div>
    </div>
  );
}
