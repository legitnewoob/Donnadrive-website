import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Copy, Linkedin, Loader2, Mail, Share2, Sparkles, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Confetti from "./Confetti";
import {
  PLACES_PER_REFERRAL,
  launchDay,
  shareLink,
  shareText,
  updateWaitlistProfile,
  type Launch,
  type WaitlistEntry,
  type WaitlistStatus,
} from "@/lib/launch";

export function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.66-1.6-.91-2.2-.24-.57-.48-.5-.66-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.98 1-3.63-.24-.37a9.78 9.78 0 0 1-1.5-5.22c0-5.41 4.4-9.82 9.83-9.82 2.63 0 5.1 1.03 6.95 2.88a9.75 9.75 0 0 1 2.87 6.95c0 5.42-4.4 9.82-9.82 9.82zm8.36-18.18A11.75 11.75 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.3-1.65a11.87 11.87 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.17-1.24-6.16-3.48-8.4z" />
    </svg>
  );
}

/** The number counts up into place. */
function Place({ place, animateIn }: { place: number; animateIn: boolean }) {
  const [shown, setShown] = useState(animateIn ? 0 : place);
  useEffect(() => {
    if (!animateIn) return setShown(place);
    const controls = animate(0, place, { duration: 0.9, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [place, animateIn]);
  return <span className="tabular-nums">#{shown.toLocaleString("en-GB")}</span>;
}

const ROLES: { value: NonNullable<WaitlistEntry["type"]>; label: string }[] = [
  { value: "adi", label: "Instructor (ADI)" },
  { value: "pdi", label: "Trainee (PDI)" },
  { value: "school", label: "Driving school" },
];
const SIZES: { value: NonNullable<WaitlistEntry["schoolSize"]>; label: string }[] = [
  { value: "2-5", label: "2–5 instructors" },
  { value: "6-15", label: "6–15" },
  { value: "16+", label: "16+" },
];
const TOOLS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone or text" },
  { value: "app", label: "A booking app" },
  { value: "other", label: "Something else" },
];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[40px] rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
        active ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

/** "Help us get you in sooner": optional, each answer saves as soon as it's tapped. */
function Questions({ entry, onSaved }: { entry: WaitlistEntry; onSaved: (e: WaitlistEntry) => void }) {
  const [area, setArea] = useState(entry.area || "");
  const [saving, setSaving] = useState(false);
  const token = entry.token!;

  async function save(data: Parameters<typeof updateWaitlistProfile>[1]) {
    setSaving(true);
    try {
      onSaved({ ...(await updateWaitlistProfile(token, data)), token });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save that");
    } finally {
      setSaving(false);
    }
  }

  const answered = [entry.type, entry.area, entry.currentTool.length].filter(Boolean).length;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">Help us get you in sooner</p>
          <p className="text-xs text-muted-foreground">We invite people who tell us a little about themselves first. All optional.</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : `${answered}/3`}</span>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">I am…</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <Chip key={r.value} active={entry.type === r.value} onClick={() => save({ type: entry.type === r.value ? null : r.value })}>
              {r.label}
            </Chip>
          ))}
        </div>
        {entry.type === "school" && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SIZES.map((s) => (
              <Chip key={s.value} active={entry.schoolSize === s.value} onClick={() => save({ schoolSize: s.value })}>
                {s.label}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="wl-area" className="text-sm font-medium">Where do you teach?</label>
        <Input
          id="wl-area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          onBlur={() => area.trim() !== (entry.area || "") && save({ area: area.trim() })}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          placeholder="Town or postcode area, e.g. Leeds or LS6"
          className="h-11 bg-white text-base sm:text-sm"
          autoComplete="address-level2"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">How do learners book with you today?</p>
        <div className="flex flex-wrap gap-2">
          {TOOLS.map((t) => {
            const on = entry.currentTool.includes(t.value);
            return (
              <Chip
                key={t.value}
                active={on}
                onClick={() => save({ currentTool: on ? entry.currentTool.filter((x) => x !== t.value) : [...entry.currentTool, t.value] })}
              >
                {t.label}
              </Chip>
            );
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <Checkbox checked={entry.marketingConsent} onCheckedChange={(v) => save({ marketingConsent: v === true })} className="mt-0.5" />
        <span className="text-slate-700">Email me product news and tips too. <span className="text-muted-foreground">(You'll get your invite either way.)</span></span>
      </label>
    </div>
  );
}

function Share({ code }: { code: string }) {
  const link = shareLink(code);
  const [copied, setCopied] = useState(false);
  const message = `${shareText} ${link}`;
  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Press and hold the link to copy it.");
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <Input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Your link" className="h-11 bg-white font-mono text-sm" />
        <Button type="button" variant="outline" className="h-11 shrink-0" onClick={copy}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          <span className="ml-1.5">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button asChild className="h-11 bg-[#25D366] text-white hover:bg-[#1ebe5b] sm:flex-1">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon className="mr-2 h-4 w-4" /> WhatsApp
          </a>
        </Button>
        {canNativeShare ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 sm:flex-1"
            onClick={() => navigator.share({ title: "Donna Drive", text: shareText, url: link }).catch(() => {})}
          >
            <Share2 className="mr-2 h-4 w-4" /> More
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="icon" className="h-11 w-11" aria-label="Share on X">
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><Twitter className="h-4 w-4" /></a>
            </Button>
            <Button asChild variant="outline" size="icon" className="h-11 w-11" aria-label="Share on LinkedIn">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
            </Button>
            <Button asChild variant="outline" size="icon" className="h-11 w-11" aria-label="Share by email">
              <a href={`mailto:?subject=${encodeURIComponent("Have you seen Donna Drive?")}&body=${encodeURIComponent(message)}`}><Mail className="h-4 w-4" /></a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  entry: WaitlistEntry | WaitlistStatus;
  launch: Launch;
  /** Straight after joining: confetti and the number counting into place */
  celebrate?: boolean;
  onChange?: (e: WaitlistEntry) => void;
}

/** Their place, how to move up, and the optional questions. */
export default function WaitlistStatusCard({ entry: initial, launch, celebrate = false, onChange }: Props) {
  const [entry, setEntry] = useState<WaitlistEntry>(initial);
  const first = (entry.name || "").split(" ")[0];
  const friends = "friends" in initial ? initial.friends : [];
  const progress = Math.min(3, entry.referrals);
  const mounted = useRef(false);

  useEffect(() => setEntry(initial), [initial]);
  useEffect(() => {
    if (mounted.current) onChange?.(entry);
    mounted.current = true;
  }, [entry, onChange]);

  const invited = entry.status === "invited";

  return (
    <div className="relative space-y-5 text-center">
      {celebrate && <Confetti />}

      <div>
        <p className="text-sm font-medium text-muted-foreground">{invited ? `You're in, ${first} 🎉` : `You're on the list${first ? `, ${first}` : ""}!`}</p>
        <motion.p
          initial={celebrate ? { scale: 0.8, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="mt-1 text-6xl font-black tracking-tight text-slate-900 sm:text-7xl"
        >
          {invited ? <Sparkles className="mx-auto h-14 w-14 text-primary" /> : <Place place={entry.place} animateIn={celebrate} />}
        </motion.p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {invited
            ? "Check your inbox for your invite link. It's waiting for you."
            : entry.priority
              ? "You're in the next batch of invites. Thanks for sharing!"
              : launch.date
                ? `We launch ${launchDay(launch.date)}. We're letting instructors in in small batches so everyone gets their own WhatsApp number and a proper setup.`
                : "We're letting instructors in in small batches so everyone gets their own WhatsApp number and a proper setup."}
        </p>
      </div>

      {!invited && (
        <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 text-left">
          <div>
            <p className="font-semibold text-slate-900">Want in sooner? Share your link</p>
            <p className="text-sm text-muted-foreground">
              Every instructor who joins with it moves you up {PLACES_PER_REFERRAL} places. Get 3 to join and you're in the next batch.
              When a friend starts paying, you both get a month free.
            </p>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs font-medium">
              <span>{entry.priority ? "Priority invite unlocked" : `${progress} of 3 friends · priority invite`}</span>
              {entry.referrals > 0 && <span className="text-primary">Moved up {entry.referrals * PLACES_PER_REFERRAL} places</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div className="h-full rounded-full bg-primary" initial={{ width: 0 }} animate={{ width: `${(progress / 3) * 100}%` }} transition={{ duration: 0.6 }} />
            </div>
          </div>
          <Share code={entry.referralCode} />
          {friends.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Joined with your link: {friends.map((f) => f.name).join(", ")}
            </p>
          )}
        </div>
      )}

      {entry.token && !invited && <Questions entry={entry} onSaved={setEntry} />}

      <p className="text-xs text-muted-foreground">We've emailed you a link to come back to this page any time.</p>
    </div>
  );
}
