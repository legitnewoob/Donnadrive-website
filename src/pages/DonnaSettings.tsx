import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Route as RouteIcon,
  CalendarClock,
  ShieldCheck,
  MessageSquareText,
  BellRing,
  Loader2,
  Plus,
  X,
  Home,
  Search,
  CheckCircle2,
  MinusCircle,
  XCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getSettings,
  updateSettings,
  previewRoute,
  notifySetupChanged,
  type SetupStatus,
  type DonnaSettings as Settings,
  type RouteSettings,
  type BotSettings,
  type DayKey,
  type RoutePreset,
  type RoutePreview,
} from "@/lib/api";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const HOURLY = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);

const PRESETS: { key: Exclude<RoutePreset, "custom">; label: string; blurb: string }[] = [
  { key: "off", label: "Off", blurb: "Offer every free slot. No route checks." },
  { key: "relaxed", label: "Relaxed", blurb: "More choice for learners. Up to 30 min extra driving per lesson." },
  { key: "balanced", label: "Balanced", blurb: "Up to 20 min extra driving per lesson. Recommended." },
  { key: "tight", label: "Tight", blurb: "Fewest miles. Up to 12 min extra driving; fewer slots offered." },
];

const TONES: { key: BotSettings["tone"]; label: string; blurb: string }[] = [
  { key: "friendly", label: "Friendly", blurb: "Warm and chatty" },
  { key: "professional", label: "Professional", blurb: "Polite, no slang" },
  { key: "brief", label: "Brief", blurb: "One or two short sentences" },
];

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full rounded-lg border bg-white p-0.5 sm:inline-flex sm:w-auto">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={`flex-1 px-2 py-1.5 text-sm leading-tight rounded-md transition-colors sm:flex-none sm:px-3 ${
            value === o.key ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  description,
  dirty,
  saving,
  onSave,
  onReset,
  children,
  tour,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReset: () => void;
  children: React.ReactNode;
  tour?: string;
}) {
  return (
    <Card id={id} data-tour={tour} className="scroll-mt-32 lg:scroll-mt-20">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="h-4 w-4 text-sky-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        {/* On phones the sticky save bar replaces this */}
        <div className="hidden sm:flex items-center justify-end gap-2 border-t pt-4">
          {dirty && (
            <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>
              Discard changes
            </Button>
          )}
          <Button size="sm" onClick={onSave} disabled={!dirty || saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, help, required, children }: { label: string; help?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
            Required
          </span>
        )}
      </Label>
      {children}
      {help && <p className="text-xs text-slate-500">{help}</p>}
    </div>
  );
}

function SwitchRow({
  label,
  help,
  checked,
  onChange,
}: {
  label: string;
  help: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{help}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

type Break = BotSettings["breaks"][number];
const validBreak = (b: Break) => !!b.from && !!b.to && b.from < b.to;

// Same rule Donna uses: a start time is dropped if the lesson would overlap a break.
function clashingBreak(time: string, lessonMin: number, breaks: Break[]) {
  const start = toMinutes(time);
  const end = start + lessonMin;
  return breaks.find((b) => validBreak(b) && start < toMinutes(b.to) && end > toMinutes(b.from));
}

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function tomorrowPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function DonnaSettings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const token = localStorage.getItem("dd_token");
  const [saved, setSaved] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [baseAddress, setBaseAddress] = useState("");
  const [route, setRoute] = useState<RouteSettings | null>(null);
  const [districtsText, setDistrictsText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bot, setBot] = useState<BotSettings | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const [previewDate, setPreviewDate] = useState(tomorrowPlus(2));
  const [previewAddress, setPreviewAddress] = useState("");
  const [preview, setPreview] = useState<RoutePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);

  function apply(s: Settings) {
    if (s.setup) setSetup(s.setup);
    setSaved(s);
    setBaseAddress(s.baseAddress);
    setRoute(s.routeSettings);
    setDistrictsText(s.routeSettings.serviceArea.postcodeDistricts.join(", "));
    setBot(s.botSettings);
  }

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    getSettings(token)
      .then((s) => {
        apply(s);
        if (s.routeSettings.preset === "custom") setShowAdvanced(true);
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Failed to load settings"))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  // Arriving from a setup link like /settings#route: jump there once the page has loaded
  useEffect(() => {
    if (loading || !location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    return () => clearTimeout(t);
  }, [loading, location.hash]);

  const districts = useMemo(
    () =>
      districtsText
        .split(/[\s,]+/)
        .map((d) => d.trim().toUpperCase())
        .filter(Boolean),
    [districtsText]
  );

  const routeDraft = useMemo<RouteSettings | null>(
    () => (route ? { ...route, serviceArea: { ...route.serviceArea, postcodeDistricts: districts } } : null),
    [route, districts]
  );

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <DashboardLayout title="Donna Settings">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!saved || !route || !bot || !routeDraft) {
    return (
      <DashboardLayout title="Donna Settings">
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">{loadError || "Couldn't load settings."}</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const presetValues = saved.presets;
  const effective = (field: "maxAddedDriveMin" | "travelGraceMin") =>
    route.preset !== "custom" && route.preset !== "off" && presetValues[route.preset]?.[field] !== undefined
      ? (presetValues[route.preset][field] as number)
      : route[field];
  const effectivePenalty =
    route.preset !== "custom" && route.preset !== "off"
      ? (presetValues[route.preset]?.fragmentationPenalty as RouteSettings["fragmentationPenalty"])
      : route.fragmentationPenalty;

  const setRouteField = <K extends keyof RouteSettings>(key: K, value: RouteSettings[K], makesCustom = false) =>
    setRoute((r) => {
      if (!r) return r;
      if (!makesCustom || r.preset === "custom") return { ...r, [key]: value };
      // Switching to custom: keep the preset's values for the other tuned fields.
      const p = presetValues[r.preset] || {};
      return {
        ...r,
        maxAddedDriveMin: (p.maxAddedDriveMin as number) ?? r.maxAddedDriveMin,
        travelGraceMin: (p.travelGraceMin as number) ?? r.travelGraceMin,
        fragmentationPenalty: (p.fragmentationPenalty as RouteSettings["fragmentationPenalty"]) ?? r.fragmentationPenalty,
        preset: "custom",
        [key]: value,
      };
    });

  const setBotField = <K extends keyof BotSettings>(key: K, value: BotSettings[K]) =>
    setBot((b) => (b ? { ...b, [key]: value } : b));

  const routeDirty = !same(routeDraft, saved.routeSettings) || baseAddress.trim() !== saved.baseAddress;
  const availabilityKeys = ["workingHours", "breaks", "maxLessonsPerDay", "minNoticeHours", "bookingWindowDays", "holiday"] as const;
  const rulesKeys = ["acceptingNewLearners", "allowCancel", "allowReschedule", "cancellationNoticeHours", "lateCancellationFee"] as const;
  const alertKeys = ["reminders", "notifications", "handover"] as const;
  const personalityKeys = ["tone", "emojis", "customGreeting", "aboutLessons"] as const;
  const pick = (src: BotSettings, keys: readonly (keyof BotSettings)[]) =>
    Object.fromEntries(keys.map((k) => [k, src[k]])) as Partial<BotSettings>;
  const dirtyFor = (keys: readonly (keyof BotSettings)[]) => !same(pick(bot, keys), pick(saved.botSettings, keys));

  async function save(section: string, body: Parameters<typeof updateSettings>[1]) {
    setSaving(section);
    try {
      const next = await updateSettings(token!, body);
      setSaved(next);
      if (next.setup) setSetup(next.setup);
      notifySetupChanged();
      // Only reset the fields that were saved; keep unsaved edits elsewhere.
      if (section === "route" || section === "all") {
        setBaseAddress(next.baseAddress);
        setRoute(next.routeSettings);
        setDistrictsText(next.routeSettings.serviceArea.postcodeDistricts.join(", "));
      }
      if (body.botSettings) {
        setBot((b) => (b ? { ...b, ...pick(next.botSettings, Object.keys(body.botSettings || {}) as (keyof BotSettings)[]) } : b));
      }
      if (body.botSettings?.workingHours && breakClashes.length) {
        toast.warning(
          `Saved, but ${breakClashes.length} start time${breakClashes.length === 1 ? " clashes" : "s clash"} with your breaks and won't be offered.`
        );
      } else {
        toast.success("Saved. Donna will use this from her next message.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(null);
    }
  }

  function routeBody() {
    const body: Parameters<typeof updateSettings>[1] = {};
    if (baseAddress.trim() !== saved!.baseAddress) body.baseAddress = baseAddress.trim();
    if (!same(routeDraft, saved!.routeSettings)) body.routeSettings = routeDraft!;
    return body;
  }

  function saveRoute() {
    return save("route", routeBody());
  }

  // Until working hours have been saved once, the defaults shown still need confirming
  const hoursUnconfirmed = !!setup && !setup.hasNumber && setup.required.some((r) => r.key === "workingHours" && !r.done);
  const availabilityDirty = dirtyFor(availabilityKeys) || hoursUnconfirmed;

  const sections = [
    { id: "route", label: "Route", dirty: routeDirty },
    { id: "availability", label: "Availability", dirty: availabilityDirty, keys: availabilityKeys },
    { id: "rules", label: "Rules", dirty: dirtyFor(rulesKeys), keys: rulesKeys },
    { id: "alerts", label: "Reminders", dirty: dirtyFor(alertKeys), keys: alertKeys },
    { id: "personality", label: "Personality", dirty: dirtyFor(personalityKeys), keys: personalityKeys },
  ];
  const dirtySections = sections.filter((x) => x.dirty);

  // Phones: one save for everything changed, so edits aren't lost between cards.
  function saveAll() {
    const body = routeDirty ? routeBody() : {};
    const botKeys = dirtySections.flatMap((x) => x.keys ?? []);
    if (botKeys.length) body.botSettings = pick(bot!, botKeys);
    return save(routeDirty ? "all" : "bot", body);
  }

  async function runPreview() {
    if (!previewAddress.trim()) {
      toast.error("Enter a learner's postcode to try");
      return;
    }
    setPreviewing(true);
    try {
      setPreview(await previewRoute(token!, { date: previewDate, address: previewAddress.trim(), routeSettings: routeDraft! }));
    } catch (e) {
      setPreview(null);
      toast.error(e instanceof Error ? e.message : "Couldn't preview");
    } finally {
      setPreviewing(false);
    }
  }

  const allTimes = (day: DayKey) =>
    Array.from(new Set([...HOURLY, ...bot.workingHours[day]])).sort();

  const breakClashes = DAYS.flatMap(({ key, label }) =>
    bot.workingHours[key].flatMap((time) => {
      const brk = clashingBreak(time, route.lessonDurationMin, bot.breaks);
      return brk ? [{ day: key, label, time, brk }] : [];
    })
  );
  const clashesByTime = Object.values(
    breakClashes.reduce<Record<string, { time: string; brk: Break; days: string[] }>>((acc, c) => {
      const k = `${c.time}|${c.brk.from}`;
      (acc[k] ??= { time: c.time, brk: c.brk, days: [] }).days.push(c.label);
      return acc;
    }, {})
  ).sort((a, b) => a.time.localeCompare(b.time));

  function removeClashingTimes() {
    const next = { ...bot!.workingHours };
    for (const { day, time } of breakClashes) next[day] = next[day].filter((t) => t !== time);
    setBotField("workingHours", next);
  }

  function toggleTime(day: DayKey, time: string) {
    const current = bot!.workingHours[day];
    const next = current.includes(time) ? current.filter((t) => t !== time) : [...current, time].sort();
    setBotField("workingHours", { ...bot!.workingHours, [day]: next });
  }

  function toggleDay(day: DayKey, on: boolean) {
    const fallback = ["09:00", "11:00", "13:00", "15:00"];
    const restore = [saved!.botSettings.workingHours[day], bot!.workingHours.mon, fallback].find((t) => t.length) ?? fallback;
    setBotField("workingHours", { ...bot!.workingHours, [day]: on ? [...restore] : [] });
  }

  function copyMondayToWeekdays() {
    const mon = bot!.workingHours.mon;
    setBotField("workingHours", { ...bot!.workingHours, tue: [...mon], wed: [...mon], thu: [...mon], fri: [...mon] });
  }

  return (
    <DashboardLayout
      title="Donna Settings"
      subtitle="Control how Donna books and talks to your learners"
      mobileFooter={
        dirtySections.length > 0 && (
          <div className="flex items-center gap-2 border-b bg-white px-4 py-2.5">
            <p className="min-w-0 flex-1 truncate text-sm text-slate-700">
              <span className="font-medium">Unsaved:</span> {dirtySections.map((x) => x.label).join(", ")}
            </p>
            <Button variant="ghost" size="sm" onClick={() => apply(saved)} disabled={!!saving}>
              Discard
            </Button>
            <Button size="sm" onClick={saveAll} disabled={!!saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </div>
        )
      }
    >
      <SectionNav sections={sections} />
      <div className="space-y-6 max-w-4xl">
        {setup && !setup.complete && !setup.hasNumber && (
          <SetupBanner setup={setup} onGo={(link) => (link.startsWith("/settings#") ? scrollToSection(link.split("#")[1]) : navigate(link))} />
        )}
        {/* ── Route & travel ───────────────────────────────────────────── */}
        <Section
          id="route"
          tour="settings-route"
          icon={RouteIcon}
          title="Route & travel"
          description="How Donna fits new lessons around the ones you already have, to keep your driving down."
          dirty={routeDirty}
          saving={saving === "route" || saving === "all"}
          onSave={saveRoute}
          onReset={() => apply(saved)}
        >
          <Field
            label="Your home or base address"
            required={!!setup && !setup.hasNumber}
            help={
              saved.hasBaseLocation
                ? "Used for the drive to your first lesson and home from your last."
                : "Not set yet, so Donna can't count the drive to your first lesson or home from your last."
            }
          >
            <div className="relative">
              <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={baseAddress}
                onChange={(e) => setBaseAddress(e.target.value)}
                placeholder="e.g. ST5 1AB or 12 High Street, Newcastle"
                className="pl-9"
              />
            </div>
          </Field>

          <Field label="How tightly should Donna pack your day?">
            <Segmented
              value={route.preset === "custom" ? ("custom" as RoutePreset) : route.preset}
              options={[...PRESETS, ...(route.preset === "custom" ? [{ key: "custom" as const, label: "Custom" }] : [])]}
              onChange={(v) => setRouteField("preset", v)}
            />
            <p className="text-xs text-slate-500">
              {route.preset === "custom"
                ? "Using your own values below."
                : PRESETS.find((p) => p.key === route.preset)?.blurb}
            </p>
          </Field>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm font-medium text-sky-700 hover:underline"
          >
            {showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
          </button>

          {showAdvanced && (
            <div className="grid gap-5 sm:grid-cols-2 rounded-xl border bg-slate-50 p-4">
              <Field label="Lesson length" help="Used to check you can make the next lesson on time.">
                <select
                  value={route.lessonDurationMin}
                  onChange={(e) => setRouteField("lessonDurationMin", Number(e.target.value))}
                  className="h-10 w-full rounded-md border bg-white px-3 text-base sm:text-sm"
                >
                  {Array.from({ length: 11 }, (_, i) => 30 + i * 15).map((m) => (
                    <option key={m} value={m}>
                      {m % 60 === 0 ? `${m / 60} hour${m > 60 ? "s" : ""}` : `${m} minutes`}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                label="Allowed lateness between lessons (min)"
                help="With back-to-back lessons there's no gap to travel; this is how many minutes over you'll accept."
              >
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={effective("travelGraceMin")}
                  onChange={(e) => setRouteField("travelGraceMin", Number(e.target.value), true)}
                  disabled={route.preset === "off"}
                />
              </Field>
              <Field label="Max extra driving per lesson (min)" help="Slots that add more than this aren't offered.">
                <Input
                  type="number"
                  min={5}
                  max={60}
                  value={effective("maxAddedDriveMin")}
                  onChange={(e) => setRouteField("maxAddedDriveMin", Number(e.target.value), true)}
                  disabled={route.preset === "off"}
                />
              </Field>
              <Field label="Count the drive from and to home" help="For your first and last lesson of the day.">
                <Segmented
                  value={route.homeLegWeight}
                  options={[
                    { key: "off", label: "Don't count" },
                    { key: "half", label: "Half" },
                    { key: "full", label: "Fully" },
                  ]}
                  onChange={(v) => setRouteField("homeLegWeight", v)}
                />
              </Field>
              <Field
                label="Avoid leaving gaps you can't fill"
                help="How strongly Donna avoids slots that leave a free hour too far from anything to sell."
              >
                <Segmented
                  value={effectivePenalty}
                  options={[
                    { key: "off", label: "Off" },
                    { key: "low", label: "Low" },
                    { key: "medium", label: "Medium" },
                    { key: "high", label: "High" },
                  ]}
                  onChange={(v) => setRouteField("fragmentationPenalty", v, true)}
                />
              </Field>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Service area radius"
              help={`New learners further than this are told you don't cover their area. Leave empty for no limit (max ${route.serviceArea.unit === "km" ? "80 km" : "50 miles"}).`}
            >
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  max={route.serviceArea.unit === "km" ? 80 : 50}
                  value={route.serviceArea.radius ?? ""}
                  onChange={(e) => setRouteField("serviceArea", { ...route.serviceArea, radius: numOrNull(e.target.value) })}
                  placeholder="No limit"
                  className="min-w-0 flex-1"
                />
                <div className="w-32 shrink-0">
                  <Segmented
                    value={route.serviceArea.unit}
                    options={[
                      { key: "miles", label: "miles" },
                      { key: "km", label: "km" },
                    ]}
                    onChange={(unit) => setRouteField("serviceArea", { ...route.serviceArea, unit })}
                  />
                </div>
              </div>
            </Field>
            <Field label="Postcode areas you always cover" help="Comma-separated, e.g. ST4, ST5. These are accepted even outside the radius.">
              <Input value={districtsText} onChange={(e) => setDistrictsText(e.target.value)} placeholder="ST4, ST5" />
            </Field>
          </div>

          <SwitchRow
            label="Suggest days that fit your route"
            help={`When a day doesn't work, Donna offers days in the next ${route.lookAheadDays} working days where you're already nearby.`}
            checked={route.suggestOtherDays}
            onChange={(v) => setRouteField("suggestOtherDays", v)}
          />
          {route.suggestOtherDays && (
            <Field label="How many working days ahead to look">
              <Input
                type="number"
                min={5}
                max={20}
                value={route.lookAheadDays}
                onChange={(e) => setRouteField("lookAheadDays", Number(e.target.value))}
                className="max-w-[8rem]"
              />
            </Field>
          )}

          {/* Try it */}
          <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 space-y-3" data-tour="settings-preview">
            <div>
              <p className="text-sm font-semibold text-slate-800">Try it</p>
              <p className="text-xs text-slate-500">
                See which times Donna would offer a learner, using the settings above (even before you save).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input type="date" value={previewDate} onChange={(e) => setPreviewDate(e.target.value)} className="sm:w-44 bg-white" />
              <Input
                value={previewAddress}
                onChange={(e) => setPreviewAddress(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runPreview()}
                placeholder="Learner's postcode"
                className="bg-white"
              />
              <Button onClick={runPreview} disabled={previewing} variant="secondary" className="shrink-0">
                {previewing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
                Preview
              </Button>
            </div>
            {preview && <PreviewResult preview={preview} />}
          </div>
        </Section>

        {/* ── Availability ─────────────────────────────────────────────── */}
        <Section
          id="availability"
          tour="settings-availability"
          icon={CalendarClock}
          title="Availability"
          description="When learners can book with you."
          dirty={availabilityDirty}
          saving={saving === "availability" || saving === "all" || saving === "bot"}
          onSave={() => save("availability", { botSettings: pick(bot, availabilityKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, availabilityKeys) } : b))}
        >
          <Field label="Working days and lesson start times" help="Tap a time to turn it on or off." required={!!setup && !setup.hasNumber}>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => (
                <WorkingDayRow
                  key={key}
                  label={label}
                  times={allTimes(key)}
                  selected={bot.workingHours[key]}
                  clashing={breakClashes.filter((c) => c.day === key).map((c) => c.time)}
                  onToggleTime={(t) => toggleTime(key, t)}
                  onToggleDay={(on) => toggleDay(key, on)}
                />
              ))}
              <Button variant="ghost" size="sm" onClick={copyMondayToWeekdays} className="text-sky-700 px-0">
                Copy Monday's times to Tue–Fri
              </Button>
            </div>
          </Field>

          <Field label="Breaks" help="Donna won't book lessons that overlap these, every working day.">
            <div className="space-y-2">
              {bot.breaks.map((b, i) => (
                <div key={i} className="space-y-1">
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={b.from}
                    aria-invalid={!validBreak(b)}
                    onChange={(e) => setBotField("breaks", bot.breaks.map((x, j) => (j === i ? { ...x, from: e.target.value } : x)))}
                    className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                  />
                  <span className="text-sm text-slate-400">to</span>
                  <Input
                    type="time"
                    value={b.to}
                    onChange={(e) => setBotField("breaks", bot.breaks.map((x, j) => (j === i ? { ...x, to: e.target.value } : x)))}
                    className="min-w-0 flex-1 sm:w-32 sm:flex-none"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0" aria-label="Remove break" onClick={() => setBotField("breaks", bot.breaks.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {!validBreak(b) && (
                  <p className="text-xs text-red-600">This break must end after it starts.</p>
                )}
                </div>
              ))}
              {bot.breaks.length < 5 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBotField("breaks", [...bot.breaks, { from: "12:00", to: "13:00" }])}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add break
                </Button>
              )}
            </div>
          </Field>

          {clashesByTime.length > 0 && (
            <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="min-w-0 space-y-2">
                  <p className="font-medium text-amber-900">
                    {breakClashes.length} lesson start time{breakClashes.length === 1 ? "" : "s"} clash with your breaks
                  </p>
                  <ul className="space-y-1 text-amber-800">
                    {clashesByTime.map((c) => (
                      <li key={`${c.time}|${c.brk.from}`}>
                        <span className="font-medium">{c.time}</span> on {c.days.join(", ")} — a {route.lessonDurationMin}-minute lesson
                        runs into your {c.brk.from}–{c.brk.to} break
                      </li>
                    ))}
                  </ul>
                  <p className="text-amber-800">Donna won't offer these times. Remove them, move the break, or shorten the lesson length.</p>
                  <Button variant="outline" size="sm" onClick={removeClashingTimes} className="border-amber-300 bg-white">
                    Remove clashing times
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Max lessons per day" help="Leave empty for no limit.">
              <Input
                type="number"
                min={1}
                max={15}
                value={bot.maxLessonsPerDay ?? ""}
                onChange={(e) => setBotField("maxLessonsPerDay", numOrNull(e.target.value))}
                placeholder="No limit"
              />
            </Field>
            <Field label="Minimum notice (hours)" help="24 = no bookings for today or tomorrow.">
              <Input
                type="number"
                min={0}
                max={168}
                value={bot.minNoticeHours}
                onChange={(e) => setBotField("minNoticeHours", Number(e.target.value))}
              />
            </Field>
            <Field label="Book up to (days ahead)">
              <Input
                type="number"
                min={7}
                max={180}
                value={bot.bookingWindowDays}
                onChange={(e) => setBotField("bookingWindowDays", Number(e.target.value))}
              />
            </Field>
          </div>

          <div className="rounded-xl border p-4 space-y-4">
            <SwitchRow
              label="Holiday mode"
              help="Donna tells learners you're away and offers dates after you're back."
              checked={bot.holiday.enabled}
              onChange={(v) => setBotField("holiday", { ...bot.holiday, enabled: v })}
            />
            {bot.holiday.enabled && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Away from">
                  <Input
                    type="date"
                    value={bot.holiday.from ?? ""}
                    onChange={(e) => setBotField("holiday", { ...bot.holiday, from: e.target.value || null })}
                  />
                </Field>
                <Field label="Back after">
                  <Input
                    type="date"
                    value={bot.holiday.to ?? ""}
                    onChange={(e) => setBotField("holiday", { ...bot.holiday, to: e.target.value || null })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Message for learners (optional)">
                    <Input
                      value={bot.holiday.message}
                      maxLength={300}
                      onChange={(e) => setBotField("holiday", { ...bot.holiday, message: e.target.value })}
                      placeholder="e.g. I'm on holiday — back on the 21st!"
                    />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* ── Booking rules ────────────────────────────────────────────── */}
        <Section
          id="rules"
          tour="settings-rules"
          icon={ShieldCheck}
          title="Booking rules"
          description="What Donna is allowed to do for learners."
          dirty={dirtyFor(rulesKeys)}
          saving={saving === "rules" || saving === "all" || saving === "bot"}
          onSave={() => save("rules", { botSettings: pick(bot, rulesKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, rulesKeys) } : b))}
        >
          <SwitchRow
            label="Accepting new learners"
            help="When off, Donna tells new numbers you're full. Existing learners can still book."
            checked={bot.acceptingNewLearners}
            onChange={(v) => setBotField("acceptingNewLearners", v)}
          />
          <SwitchRow
            label="Learners can cancel through Donna"
            help="When off, Donna asks them to contact you directly."
            checked={bot.allowCancel}
            onChange={(v) => setBotField("allowCancel", v)}
          />
          <SwitchRow
            label="Learners can reschedule through Donna"
            help="When off, Donna asks them to contact you directly."
            checked={bot.allowReschedule}
            onChange={(v) => setBotField("allowReschedule", v)}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Cancellation notice (hours)"
              help="Cancelling with less notice than this gets a warning first, and is flagged as a late cancellation. 0 turns it off."
            >
              <Input
                type="number"
                min={0}
                max={168}
                value={bot.cancellationNoticeHours}
                onChange={(e) => setBotField("cancellationNoticeHours", Number(e.target.value))}
              />
            </Field>
            <Field label="Late cancellation fee (£)" help="Shown in the warning. Leave empty to just say you may still charge.">
              <Input
                type="number"
                min={0}
                max={500}
                step="0.01"
                value={bot.lateCancellationFee ?? ""}
                onChange={(e) => setBotField("lateCancellationFee", numOrNull(e.target.value))}
                placeholder="No fee shown"
              />
            </Field>
          </div>
        </Section>

        {/* ── Reminders & alerts ───────────────────────────────────────── */}
        <Section
          id="alerts"
          tour="settings-alerts"
          icon={BellRing}
          title="Reminders & alerts"
          description="Reminders Donna sends learners, and what she tells you."
          dirty={dirtyFor(alertKeys)}
          saving={saving === "alerts" || saving === "all" || saving === "bot"}
          onSave={() => save("alerts", { botSettings: pick(bot, alertKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, alertKeys) } : b))}
        >
          <Field
            label="Lesson reminders for learners"
            help="Sent on WhatsApp with buttons to confirm, reschedule or cancel."
          >
            <Segmented
              value={bot.reminders}
              options={[
                { key: "off", label: "Off" },
                { key: "24h", label: "Day before" },
                { key: "24h+2h", label: "Day before + 2h before" },
              ]}
              onChange={(v) => setBotField("reminders", v)}
            />
          </Field>
          <Field label="Tell me when a learner…" help="Alerts appear in the portal's bell.">
            <div className="flex flex-wrap gap-2">
              {([
                ["booked", "Books"],
                ["cancelled", "Cancels"],
                ["rescheduled", "Moves a lesson"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBotField("notifications", { ...bot.notifications, [key]: !bot.notifications[key] })}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    bot.notifications[key] ? "bg-sky-600 border-sky-600 text-white" : "bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>
          <SwitchRow
            label="Also email me"
            help="Sends the same alerts to your account email."
            checked={bot.notifications.email}
            onChange={(v) => setBotField("notifications", { ...bot.notifications, email: v })}
          />
          <SwitchRow
            label={'"Talk to my instructor" handover'}
            help="When a learner asks for you, Donna pauses for that chat and lets you know. Turn her back on from the Learners page."
            checked={bot.handover}
            onChange={(v) => setBotField("handover", v)}
          />
        </Section>

        {/* ── Personality ──────────────────────────────────────────────── */}
        <Section
          id="personality"
          tour="settings-personality"
          icon={MessageSquareText}
          title="Donna's personality"
          description="How Donna sounds, and what she knows about your lessons."
          dirty={dirtyFor(personalityKeys)}
          saving={saving === "personality" || saving === "all" || saving === "bot"}
          onSave={() => save("personality", { botSettings: pick(bot, personalityKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, personalityKeys) } : b))}
        >
          <Field label="Tone" help={TONES.find((t) => t.key === bot.tone)?.blurb}>
            <Segmented value={bot.tone} options={TONES} onChange={(v) => setBotField("tone", v)} />
          </Field>
          <SwitchRow
            label="Use emojis"
            help="When off, Donna's messages have no emojis."
            checked={bot.emojis}
            onChange={(v) => setBotField("emojis", v)}
          />
          <Field label="Greeting for new learners" help="The first thing Donna says to someone new. Leave empty for the default.">
            <Input
              value={bot.customGreeting}
              maxLength={300}
              onChange={(e) => setBotField("customGreeting", e.target.value)}
              placeholder="👋 Hi! Let's get started."
            />
          </Field>
          <Field
            label="About my lessons"
            help={`Donna uses this to answer common questions. ${bot.aboutLessons.length}/1000 characters.`}
          >
            <Textarea
              value={bot.aboutLessons}
              maxLength={1000}
              rows={5}
              onChange={(e) => setBotField("aboutLessons", e.target.value)}
              placeholder="e.g. I teach in a manual Ford Fiesta. Test centres: Newcastle and Cobridge. I take cash or bank transfer. Bring your provisional licence to every lesson."
            />
          </Field>
        </Section>
      </div>
    </DashboardLayout>
  );
}

function SetupBanner({ setup, onGo }: { setup: SetupStatus; onGo: (link: string) => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50/70 p-4">
      <p className="font-semibold text-red-900">Before you can get your WhatsApp number</p>
      <p className="mt-0.5 text-sm text-red-800">Donna needs these to take bookings for you:</p>
      <ul className="mt-3 space-y-1.5">
        {setup.required.map((r) => (
          <li key={r.key} className="flex items-center gap-2 text-sm">
            {r.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
            )}
            <span className={`flex-1 ${r.done ? "text-slate-500 line-through" : "text-slate-800"}`}>{r.label}</span>
            {!r.done && (
              <button onClick={() => onGo(r.link)} className="shrink-0 font-medium text-sky-700 hover:underline">
                {r.link.startsWith("/settings#") ? "Show me" : "Add"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorkingDayRow({
  label,
  times,
  selected,
  clashing,
  onToggleTime,
  onToggleDay,
}: {
  label: string;
  times: string[];
  selected: string[];
  clashing: string[];
  onToggleTime: (t: string) => void;
  onToggleDay: (on: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const working = selected.length > 0;
  const summary = working
    ? `${selected[0]} – ${selected[selected.length - 1]} · ${selected.length} start${selected.length === 1 ? "" : "s"}`
    : "Day off";

  return (
    <div className="rounded-lg border bg-white sm:flex sm:items-start sm:gap-3 sm:border-0 sm:bg-transparent">
      {/* Phones: a compact row that expands; wider screens: just the day name */}
      <div className="flex items-center gap-3 px-3 py-2 sm:w-10 sm:shrink-0 sm:p-0 sm:pt-1.5">
        <Switch
          checked={working}
          onCheckedChange={onToggleDay}
          aria-label={`Work on ${label}`}
          className="sm:hidden"
        />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 items-center gap-2 text-left sm:pointer-events-none"
        >
          <span className={`w-9 shrink-0 text-sm font-medium ${working ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
          <span className={`min-w-0 flex-1 truncate text-sm sm:hidden ${working ? "text-slate-600" : "text-slate-400"}`}>{summary}</span>
          {clashing.length > 0 && (
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 sm:hidden">
              ⚠ {clashing.length}
              <span className="sr-only"> clash{clashing.length === 1 ? "" : "es"} with breaks</span>
            </span>
          )}
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform sm:hidden ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div className={`${open ? "grid" : "hidden"} grid-cols-4 gap-1.5 border-t px-3 py-3 sm:flex sm:flex-wrap sm:border-0 sm:p-0`}>
        {times.map((t) => {
          const on = selected.includes(t);
          const clash = on && clashing.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => onToggleTime(t)}
              aria-pressed={on}
              title={clash ? `${t} clashes with a break, so Donna won't offer it` : undefined}
              className={`py-2 text-sm rounded-md border transition-colors sm:w-12 sm:py-1 sm:text-xs ${
                clash
                  ? "bg-amber-100 border-amber-400 text-amber-900"
                  : on
                    ? "bg-sky-600 border-sky-600 text-white"
                    : "bg-white text-slate-500 hover:border-slate-400"
              }`}
            >
              {clash ? (
                <span key="clash" className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap font-medium sm:text-[11px] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-3 sm:w-3" aria-hidden />
                  Break
                  <span className="sr-only"> ({t} clashes with a break)</span>
                </span>
              ) : (
                t
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionNav({ sections }: { sections: { id: string; label: string; dirty: boolean }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    // Entries only report sections whose visibility changed, so keep the full picture
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target.id, e.isIntersecting));
        const first = sections.find(({ id }) => visible.get(id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-130px 0px -55% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((x) => x.id).join()]);

  return (
    <nav
      aria-label="Settings sections"
      className="lg:hidden sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 -mt-4 mb-4 flex gap-2 overflow-x-auto border-b bg-slate-50/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 [scrollbar-width:none]"
    >
      {sections.map(({ id, label, dirty }) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            setActive(id);
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={`relative shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
            active === id ? "border-slate-900 bg-slate-900 text-white" : "bg-white text-slate-600"
          }`}
        >
          {label}
          {dirty && (
            <>
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
              <span className="sr-only">, unsaved changes</span>
            </>
          )}
        </button>
      ))}
    </nav>
  );
}

function PreviewResult({ preview }: { preview: RoutePreview }) {
  const closed: Record<string, string> = {
    not_working_day: "You don't work that day.",
    holiday: "You're on holiday that day.",
    day_full: "That day is full (daily lesson limit).",
  };

  return (
    <div className="space-y-2 text-sm">
      <p className="text-slate-600">
        Learner at <span className="font-medium text-slate-800">{preview.location}</span>
      </p>
      {!preview.serviceArea.inside && (
        <p className="text-amber-700 bg-amber-50 rounded-md px-3 py-2">
          Outside your service area ({preview.serviceArea.reason}). Donna wouldn't book a new learner here.
        </p>
      )}
      {!preview.hasBaseLocation && (
        <p className="text-slate-500 text-xs">Add your home address above to include the drive from home.</p>
      )}
      {preview.closedReason ? (
        <p className="text-slate-600">{closed[preview.closedReason] || "No slots that day."}</p>
      ) : preview.slots.length === 0 ? (
        <p className="text-slate-600">No free slots on your calendar that day.</p>
      ) : (
        <>
          {preview.usedFallback && (
            <p className="text-xs text-slate-500">
              Nothing was within your extra-driving limit, so Donna would offer the 3 best fits.
            </p>
          )}
          <ul className="divide-y rounded-lg border bg-white">
            {preview.slots.map((s) => (
              <li key={s.slot} className="flex items-start gap-3 px-3 py-2">
                {s.offered ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                ) : s.feasible ? (
                  <MinusCircle className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <span className="w-12 font-medium text-slate-800">{s.slot}</span>
                <span className="flex-1 text-slate-600">
                  {s.offered ? "Offered" : s.feasible ? "Not offered" : "Can't make it"}
                  {s.reason && <span className="text-slate-400"> · {s.reason}</span>}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
