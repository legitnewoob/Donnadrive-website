import { useEffect, useMemo, useRef, useState } from "react";
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
  SlidersHorizontal,
  Umbrella,
} from "lucide-react";
import PackingSlider from "@/components/PackingSlider";
import DayPackPreview from "@/components/DayPackPreview";
import SlotPlanner, { type SlotLength } from "@/components/SlotPlanner";
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
  previewDay,
  getLessonTypes,
  notifySetupChanged,
  type DayPreview,
  type DayHours,
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

// Setup links and old bookmarks still point at sections that have since merged
const SECTION_ALIASES: Record<string, string> = { availability: "schedule", packing: "schedule" };

// Tiny pictures of a day for the two schedule modes: lesson lengths in half hours, 0 = a gap
const PACKED_STRIP = [2, 0, 2, 0, 3, 0, 2, 0, 4];
const MANUAL_STRIP = [4, 0, 3, 0, 0, 2, 0, 2];

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
          <Icon className="h-4 w-4 text-primary" />
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

const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function tomorrowPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// A backend from before lesson slots sends only start times: show those as slots of the default length
function withSlots(s: Settings): Settings {
  if (s.botSettings.daySlots) return s;
  const durationMin = s.routeSettings.lessonDurationMin;
  const daySlots = Object.fromEntries(
    DAYS.map(({ key }) => [key, (s.botSettings.workingHours?.[key] ?? []).map((start) => ({ start, durationMin, exact: false }))])
  ) as BotSettings["daySlots"];
  return { ...s, botSettings: { ...s.botSettings, daySlots } };
}

// The saved longest drive: older settings only have the usual gap, so it's twice that
function savedMaxDrive(s: Settings) {
  return s.packing?.maxDriveMin ?? s.routeSettings.maxDriveMin ?? Math.min(60, Math.max(12, 2 * (s.routeSettings.bufferMin ?? 20)));
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
  // Lengths of the active lesson types: what a fixed-mode slot can be
  const [lessonLengths, setLessonLengths] = useState<SlotLength[]>([]);

  // "How tightly should Donna pack your day?": the most driving between lessons
  // Packed mode: the longest drive between lessons (the slider)
  const [maxDrive, setMaxDrive] = useState(40);
  const [packDay, setPackDay] = useState<DayKey>("mon");
  const [dayPreview, setDayPreview] = useState<DayPreview | null>(null);
  const [dayPreviewLoading, setDayPreviewLoading] = useState(false);
  const previewRequest = useRef(0);

  const [previewDate, setPreviewDate] = useState(tomorrowPlus(2));
  const [previewAddress, setPreviewAddress] = useState("");
  const [preview, setPreview] = useState<RoutePreview | null>(null);
  const [previewing, setPreviewing] = useState(false);

  function apply(loaded: Settings) {
    const s = withSlots(loaded);
    if (s.setup) setSetup(s.setup);
    setSaved(s);
    setBaseAddress(s.baseAddress);
    setRoute(s.routeSettings);
    setDistrictsText(s.routeSettings.serviceArea.postcodeDistricts.join(", "));
    setBot(s.botSettings);
    setMaxDrive(savedMaxDrive(s));
    const firstOn = DAYS.find((d) => s.botSettings.dayHours?.[d.key]);
    if (firstOn) setPackDay(firstOn.key);
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
    getLessonTypes(token)
      .then((types) =>
        setLessonLengths(
          types
            .filter((t) => t.active && t.durationMin)
            .map((t) => ({ durationMin: t.durationMin!, name: t.name }))
            .sort((a, b) => a.durationMin - b.durationMin)
        )
      )
      .catch(() => setLessonLengths([]));
  }, [token, navigate]);

  // Arriving from a setup link like /settings#route: jump there once the page has loaded
  useEffect(() => {
    if (loading || !location.hash) return;
    const hash = location.hash.slice(1);
    const id = SECTION_ALIASES[hash] ?? hash;
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

  // Live preview of a packed day, a moment after the slider or hours stop moving
  const previewHours = bot?.dayHours?.[packDay] ?? null;
  const previewKey = JSON.stringify([maxDrive, previewHours, bot?.lunch, bot?.scheduleMode]);
  useEffect(() => {
    if (!token || !bot || bot.scheduleMode !== "packed") return;
    if (!previewHours || previewHours.start >= previewHours.end) {
      setDayPreview(null);
      return;
    }
    const lunchOk = !bot.lunch.enabled || toMinutes(bot.lunch.windowTo) - toMinutes(bot.lunch.windowFrom) >= bot.lunch.durationMin;
    if (!lunchOk) return;
    const id = ++previewRequest.current;
    setDayPreviewLoading(true);
    const t = setTimeout(() => {
      previewDay(token, { maxDriveMin: maxDrive, dayHours: previewHours, lunch: bot.lunch })
        .then((p) => id === previewRequest.current && setDayPreview(p))
        .catch(() => id === previewRequest.current && setDayPreview(null))
        .finally(() => id === previewRequest.current && setDayPreviewLoading(false));
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewKey, token]);

  function scrollToSection(id: string) {
    document.getElementById(SECTION_ALIASES[id] ?? id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const scheduleKeys = ["scheduleMode", "dayHours", "lunch", "daySlots", "breaks"] as const;
  const limitsKeys = ["acceptingNewLearners", "maxLessonsPerDay", "minNoticeHours", "bookingWindowDays"] as const;
  const rulesKeys = ["allowCancel", "allowReschedule", "cancellationNoticeHours", "lateCancellationFee"] as const;
  const timeOffKeys = ["holiday"] as const;
  const alertKeys = ["reminders", "notifications", "handover"] as const;
  const personalityKeys = ["tone", "emojis", "customGreeting", "aboutLessons"] as const;
  const pick = (src: BotSettings, keys: readonly (keyof BotSettings)[]) =>
    Object.fromEntries(keys.map((k) => [k, src[k]])) as Partial<BotSettings>;
  const dirtyFor = (keys: readonly (keyof BotSettings)[]) => !same(pick(bot, keys), pick(saved.botSettings, keys));

  async function save(section: string, body: Parameters<typeof updateSettings>[1]) {
    setSaving(section);
    try {
      const next = withSlots(await updateSettings(token!, body));
      setSaved(next);
      if (next.setup) setSetup(next.setup);
      notifySetupChanged();
      // Only reset the fields that were saved; keep unsaved edits elsewhere.
      if (section === "route" || section === "all") {
        setBaseAddress(next.baseAddress);
        setRoute(next.routeSettings);
        setDistrictsText(next.routeSettings.serviceArea.postcodeDistricts.join(", "));
      }
      if (body.routeSettings?.maxDriveMin !== undefined) {
        setMaxDrive(savedMaxDrive(next));
        setRoute((r) => (r ? { ...r, maxDriveMin: next.routeSettings.maxDriveMin } : r));
      }
      if (body.botSettings) {
        setBot((b) => (b ? { ...b, ...pick(next.botSettings, Object.keys(body.botSettings || {}) as (keyof BotSettings)[]) } : b));
      }
      toast.success("Saved. Donna will use this from her next message.");
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

  const packed = bot.scheduleMode === "packed";
  const lunchTooShort =
    bot.lunch.enabled && toMinutes(bot.lunch.windowTo) - toMinutes(bot.lunch.windowFrom) < bot.lunch.durationMin;
  const badDays = DAYS.filter(({ key }) => {
    const h = bot.dayHours[key];
    return h && (!h.start || !h.end || toMinutes(h.end) - toMinutes(h.start) < 30);
  });
  const maxDriveDirty = maxDrive !== savedMaxDrive(saved);
  const scheduleDirty = dirtyFor(scheduleKeys) || maxDriveDirty || hoursUnconfirmed;
  // Slots are only sent once they've been changed (or need confirming at setup):
  // until then Donna keeps offering the older start times for every lesson length
  const scheduleSaveKeys = scheduleKeys.filter((k) => k !== "daySlots" || dirtyFor(["daySlots"]) || (hoursUnconfirmed && !packed));
  // Without lesson types yet, slots use the default lesson length
  const slotLengths = lessonLengths.length ? lessonLengths : [{ durationMin: route.lessonDurationMin, name: null }];
  // The usual gap Donna packs with: from the live preview while the slider moves
  const usualGap = dayPreview?.bufferMin ?? saved.packing?.bufferMin ?? Math.ceil(maxDrive / 2 / 5) * 5;
  const gapSource = dayPreview?.bufferSource ?? saved.packing?.bufferSource ?? "default";

  // What stops the schedule being saved, if anything
  function scheduleProblem() {
    if (!packed) return null;
    if (lunchTooShort) return "Make the lunch window at least as long as lunch.";
    if (badDays.length) return `${badDays[0].label}: the day must end at least 30 minutes after it starts.`;
    return null;
  }

  // The slider only matters in packed mode, but a change to it is never left unsaved
  const maxDriveBody = packed || maxDriveDirty ? { maxDriveMin: maxDrive } : null;

  function saveSchedule() {
    const problem = scheduleProblem();
    if (problem) return toast.error(problem);
    return save("schedule", { botSettings: pick(bot!, scheduleSaveKeys), ...(maxDriveBody && { routeSettings: maxDriveBody }) });
  }

  function resetSchedule() {
    setBot((b) => (b ? { ...b, ...pick(saved!.botSettings, scheduleKeys) } : b));
    setMaxDrive(savedMaxDrive(saved!));
  }

  const setDayHours = (day: DayKey, hours: DayHours) => setBotField("dayHours", { ...bot.dayHours, [day]: hours });

  function toggleWorkDay(day: DayKey, on: boolean) {
    const restore = saved!.botSettings.dayHours?.[day] || bot!.dayHours.mon || { start: "09:00", end: "17:00" };
    setDayHours(day, on ? { ...restore } : null);
    if (on) setPackDay(day);
  }

  function copyMondayHours() {
    const mon = bot!.dayHours.mon;
    setBotField("dayHours", {
      ...bot!.dayHours,
      tue: mon && { ...mon },
      wed: mon && { ...mon },
      thu: mon && { ...mon },
      fri: mon && { ...mon },
    });
  }

  const sections = [
    { id: "schedule", label: "Schedule", dirty: scheduleDirty, keys: scheduleSaveKeys },
    { id: "route", label: "Travel & area", dirty: routeDirty },
    { id: "limits", label: "Limits", dirty: dirtyFor(limitsKeys), keys: limitsKeys },
    { id: "rules", label: "Cancellations", dirty: dirtyFor(rulesKeys), keys: rulesKeys },
    { id: "timeoff", label: "Time off", dirty: dirtyFor(timeOffKeys), keys: timeOffKeys },
    { id: "alerts", label: "Reminders", dirty: dirtyFor(alertKeys), keys: alertKeys },
    { id: "personality", label: "Personality", dirty: dirtyFor(personalityKeys), keys: personalityKeys },
  ];
  const dirtySections = sections.filter((x) => x.dirty);

  // Phones: one save for everything changed, so edits aren't lost between cards.
  function saveAll() {
    const problem = scheduleDirty ? scheduleProblem() : null;
    if (problem) return toast.error(problem);
    const body = routeDirty ? routeBody() : {};
    const botKeys = dirtySections.flatMap((x) => x.keys ?? []);
    if (botKeys.length) body.botSettings = pick(bot!, botKeys);
    if (maxDriveDirty) body.routeSettings = { ...(body.routeSettings || {}), maxDriveMin: maxDrive };
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

  const breaksEditor = (
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
  );

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
      <SettingsNav sections={sections}>
        {setup && !setup.complete && !setup.hasNumber && (
          <SetupBanner setup={setup} onGo={(link) => (link.startsWith("/settings#") ? scrollToSection(link.split("#")[1]) : navigate(link))} />
        )}
        {/* ── Your schedule: who plans the day, and that mode's settings ── */}
        <Section
          id="schedule"
          tour="settings-availability"
          icon={CalendarClock}
          title="Your schedule"
          description="When you teach, and who works out the lesson start times."
          dirty={scheduleDirty}
          saving={saving === "schedule" || saving === "all" || saving === "bot"}
          onSave={saveSchedule}
          onReset={resetSchedule}
        >
          <div role="radiogroup" aria-label="How should Donna plan your day?" className="grid gap-3 sm:grid-cols-2">
            <ModeCard
              selected={packed}
              title="Donna packs my day"
              text="Set your hours. Donna works out the start times for every lesson length."
              blocks={PACKED_STRIP}
              onSelect={() => setBotField("scheduleMode", "packed")}
            />
            <ModeCard
              selected={!packed}
              title="I'll plan my day myself"
              text="Lay out your own lesson slots, each with its own length. Donna only offers those."
              blocks={MANUAL_STRIP}
              onSelect={() => setBotField("scheduleMode", "fixed")}
            />
          </div>

          {packed ? (
            <>
          <Field label="Working hours" required={!!setup && !setup.hasNumber}>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => (
                <DayHoursRow
                  key={key}
                  label={label}
                  hours={bot.dayHours[key]}
                  onToggle={(on) => toggleWorkDay(key, on)}
                  onChange={(h) => setDayHours(key, h)}
                />
              ))}
              <Button variant="ghost" size="sm" onClick={copyMondayHours} className="text-coral-deep px-0">
                Copy Monday's hours to Tue–Fri
              </Button>
            </div>
          </Field>

          <div className="rounded-xl border p-4 space-y-4">
            <SwitchRow
              label="Lunch break"
              help="Donna places it wherever it fits the most lessons, inside the window you set."
              checked={bot.lunch.enabled}
              onChange={(v) => setBotField("lunch", { ...bot.lunch, enabled: v })}
            />
            {bot.lunch.enabled && (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Lunch length">
                  <select
                    value={bot.lunch.durationMin}
                    onChange={(e) => setBotField("lunch", { ...bot.lunch, durationMin: Number(e.target.value) })}
                    className="h-10 w-full rounded-md border bg-white px-3 text-base sm:text-sm"
                  >
                    {[15, 20, 30, 45, 60, 75, 90].map((m) => (
                      <option key={m} value={m}>{m} minutes</option>
                    ))}
                  </select>
                </Field>
                <Field label="Not before">
                  <Input
                    type="time"
                    step={300}
                    value={bot.lunch.windowFrom}
                    onChange={(e) => setBotField("lunch", { ...bot.lunch, windowFrom: e.target.value })}
                  />
                </Field>
                <Field label="Finished by">
                  <Input
                    type="time"
                    step={300}
                    value={bot.lunch.windowTo}
                    aria-invalid={lunchTooShort}
                    onChange={(e) => setBotField("lunch", { ...bot.lunch, windowTo: e.target.value })}
                  />
                </Field>
                {lunchTooShort && (
                  <p role="alert" className="text-xs text-red-600 sm:col-span-3">
                    The window is shorter than a {bot.lunch.durationMin}-minute lunch.
                  </p>
                )}
              </div>
            )}
          </div>
          <Field label="Other breaks" help="Fixed times Donna keeps free, every working day.">
            {breaksEditor}
          </Field>

          <Field
            label="What's the longest you'll drive between lessons?"
            help={`Donna never plans a drive longer than ${maxDrive} minutes between two lessons.`}
          >
            <PackingSlider value={maxDrive} onChange={setMaxDrive} />
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
              <p>
                <span className="font-semibold text-slate-800">Donna packs with about {usualGap} min between lessons</span>{" "}
                {gapSource === "learned"
                  ? `(learned from your last ${saved.packing?.bufferSamples ?? ""} drives between lessons).`
                  : gapSource === "previous"
                    ? `(your previous setting, until she's seen ${saved.packing?.learnAfter ?? 10} drives between your lessons).`
                    : `(half your longest drive, until she's seen ${saved.packing?.learnAfter ?? 10} drives between your lessons).`}
              </p>
              <p>Close learners start sooner, with up to 5 minutes spare for traffic. Learners further out are fitted in when the drive doesn't cost you a lesson (or one, on a quiet day).</p>
            </div>
          </Field>

          <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Your day, packed</p>
                <p className="text-xs text-slate-500">Updates as you move the slider, before you save. Shows each lesson length from your lesson types.</p>
              </div>
              <select
                value={packDay}
                onChange={(e) => setPackDay(e.target.value as DayKey)}
                aria-label="Day to preview"
                className="h-9 rounded-md border bg-white px-2 text-sm"
              >
                {DAYS.filter((d) => bot.dayHours[d.key]).map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
                {!bot.dayHours[packDay] && <option value={packDay}>{DAYS.find((d) => d.key === packDay)?.label} (off)</option>}
              </select>
            </div>
            <DayPackPreview preview={bot.dayHours[packDay] ? dayPreview : null} loading={dayPreviewLoading} bufferMin={usualGap} />
          </div>
            </>
          ) : (
            <>
          <Field
            label="Your lesson slots"
            help="Each slot has a start and a length. Donna offers a slot for lessons of that length or shorter, unless you keep it for one length."
            required={!!setup && !setup.hasNumber}
          >
            <SlotPlanner slots={bot.daySlots} onChange={(v) => setBotField("daySlots", v)} lengths={slotLengths} breaks={bot.breaks} />
          </Field>
          <Field label="Breaks" help="Donna won't book lessons that overlap these, every working day.">
            {breaksEditor}
          </Field>

            </>
          )}
        </Section>

        {/* ── Route & travel ───────────────────────────────────────────── */}
        <Section
          id="route"
          tour="settings-route"
          icon={RouteIcon}
          title="Travel & area"
          description="Where you start from, the area you cover, and how Donna keeps your driving down."
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

          {packed ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Donna is packing your day, so how much driving she allows is set by the slider under{" "}
              <button type="button" className="font-medium text-coral-deep hover:underline" onClick={() => scrollToSection("schedule")}>
                Your schedule
              </button>
              .
            </p>
          ) : (
          <Field label="How much extra driving should Donna allow?">
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
          )}

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-sm font-medium text-coral-deep hover:underline"
          >
            {showAdvanced ? "Hide advanced settings" : "Show advanced settings"}
          </button>

          {showAdvanced && (
            <div className="grid gap-5 sm:grid-cols-2 rounded-xl border bg-slate-50 p-4">
              <Field label="Default lesson length" help="For lessons without a lesson type, and lessons booked before lesson types had lengths.">
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
              {!packed && (<>
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
              </>)}
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
          <div className="rounded-xl border bg-slate-50 p-4 space-y-3" data-tour="settings-preview">
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

        {/* ── Booking limits ───────────────────────────────────────────── */}
        <Section
          id="limits"
          icon={SlidersHorizontal}
          title="Booking limits"
          description="How many lessons Donna takes, and how far ahead."
          dirty={dirtyFor(limitsKeys)}
          saving={saving === "limits" || saving === "all" || saving === "bot"}
          onSave={() => save("limits", { botSettings: pick(bot, limitsKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, limitsKeys) } : b))}
        >
          <SwitchRow
            label="Accepting new learners"
            help="When off, Donna tells new numbers you're full. Existing learners can still book."
            checked={bot.acceptingNewLearners}
            onChange={(v) => setBotField("acceptingNewLearners", v)}
          />
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
        </Section>

        {/* ── Cancellations & changes ──────────────────────────────────── */}
        <Section
          id="rules"
          tour="settings-rules"
          icon={ShieldCheck}
          title="Cancellations & changes"
          description="What learners can change through Donna, and how much notice you need."
          dirty={dirtyFor(rulesKeys)}
          saving={saving === "rules" || saving === "all" || saving === "bot"}
          onSave={() => save("rules", { botSettings: pick(bot, rulesKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, rulesKeys) } : b))}
        >
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

        {/* ── Time off ─────────────────────────────────────────────────── */}
        <Section
          id="timeoff"
          icon={Umbrella}
          title="Time off"
          description="Pause bookings while you're away."
          dirty={dirtyFor(timeOffKeys)}
          saving={saving === "timeoff" || saving === "all" || saving === "bot"}
          onSave={() => save("timeoff", { botSettings: pick(bot, timeOffKeys) })}
          onReset={() => setBot((b) => (b ? { ...b, ...pick(saved.botSettings, timeOffKeys) } : b))}
        >
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
                { key: "24h", label: "24h before" },
                { key: "48h", label: "48h before" },
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
                    bot.notifications[key] ? "bg-primary border-primary text-white" : "bg-white text-slate-600 hover:border-slate-400"
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
      </SettingsNav>
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
              <button onClick={() => onGo(r.link)} className="shrink-0 font-medium text-coral-deep hover:underline">
                {r.link.startsWith("/settings#") ? "Show me" : "Add"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Packed mode: one weekday's start and finish
function DayHoursRow({
  label,
  hours,
  onToggle,
  onChange,
}: {
  label: string;
  hours: DayHours;
  onToggle: (on: boolean) => void;
  onChange: (hours: DayHours) => void;
}) {
  const length = hours ? toMinutes(hours.end) - toMinutes(hours.start) : 0;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2">
      <div className="flex w-20 items-center gap-2">
        <Switch checked={!!hours} onCheckedChange={onToggle} aria-label={`Work on ${label}`} />
        <span className={`text-sm font-medium ${hours ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
      </div>
      {hours ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Input
              type="time"
              step={300}
              value={hours.start}
              aria-label={`${label} start`}
              onChange={(e) => onChange({ ...hours, start: e.target.value })}
              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
            />
            <span className="text-sm text-slate-400">to</span>
            <Input
              type="time"
              step={300}
              value={hours.end}
              aria-label={`${label} finish`}
              aria-invalid={length < 30}
              onChange={(e) => onChange({ ...hours, end: e.target.value })}
              className="min-w-0 flex-1 sm:w-32 sm:flex-none"
            />
          </div>
          <span className={`text-xs ${length < 30 ? "text-red-600" : "text-slate-500"}`}>
            {length < 30 ? "Ends too early" : `${Math.floor(length / 60)}h${length % 60 ? ` ${length % 60}m` : ""}`}
          </span>
        </>
      ) : (
        <span className="text-sm text-slate-400">Day off</span>
      )}
    </div>
  );
}

// Section links around the page: a pill row on smaller screens, a side rail on wide ones
function SettingsNav({ sections, children }: { sections: { id: string; label: string; dirty: boolean }[]; children: React.ReactNode }) {
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

  function go(id: string) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const unsavedDot = (
    <>
      <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
      <span className="sr-only">, unsaved changes</span>
    </>
  );

  return (
    <>
      <nav
        aria-label="Settings sections"
        className="xl:hidden sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 -mx-4 -mt-4 mb-4 flex gap-2 overflow-x-auto border-b bg-slate-50/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6 [scrollbar-width:none]"
      >
        {sections.map(({ id, label, dirty }) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            className={`relative shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              active === id ? "border-slate-900 bg-slate-900 text-white" : "bg-white text-slate-600"
            }`}
          >
            {label}
            {dirty && unsavedDot}
          </button>
        ))}
      </nav>
      <div className="xl:flex xl:items-start xl:gap-8">
        <div className="min-w-0 max-w-4xl flex-1 space-y-6">{children}</div>
        <nav aria-label="Settings sections" className="sticky top-20 hidden w-44 shrink-0 xl:block">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</p>
          <ul className="space-y-0.5 border-l">
            {sections.map(({ id, label, dirty }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={active === id ? "true" : undefined}
                  className={`-ml-px flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    active === id ? "border-primary font-medium text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {label}
                  {dirty && (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="sr-only">, unsaved changes</span>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}

// One of the two ways to plan a day, as a large radio card
function ModeCard({
  selected,
  title,
  text,
  blocks,
  onSelect,
}: {
  selected: boolean;
  title: string;
  text: string;
  blocks: number[];
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex flex-col rounded-xl border-2 p-4 text-left transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          aria-hidden
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-primary" : "border-slate-300"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <span className="text-sm font-semibold text-slate-900">{title}</span>
      </span>
      <span className="mt-1.5 block text-xs text-slate-600">{text}</span>
      <span aria-hidden className="mt-auto flex h-2 w-full gap-0.5 pt-3 box-content">
        {blocks.map((b, i) => (
          <span
            key={i}
            style={{ flexGrow: b || 0.5 }}
            className={`rounded-sm ${b ? (selected ? "bg-primary" : "bg-slate-300") : "bg-transparent"}`}
          />
        ))}
      </span>
    </button>
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
