import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, Loader2, MessageCircle, Search, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { getSchoolLearners, getLearnerDetail, updateLearnerNotes, type SchoolLearner } from "@/lib/api";

type Detail = Awaited<ReturnType<typeof getLearnerDetail>>;

const shortDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const PROGRESS: Record<SchoolLearner["progressLevel"], string> = { new: "New", active: "Learning", "test-ready": "Test ready" };

/**
 * Every learner across a driving school's instructors, for the owner or a manager:
 * search and filter by instructor, see how each is doing, leave notes for the
 * instructor, and message the learner on WhatsApp.
 */
export default function SchoolLearners() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const token = localStorage.getItem("dd_token");
  const [learners, setLearners] = useState<SchoolLearner[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const instructor = params.get("instructor") || "";
  const [open, setOpen] = useState<string | null>(params.get("learner"));

  useEffect(() => {
    if (!token) return navigate("/");
    getSchoolLearners(token)
      .then(setLearners)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load learners"));
  }, [token, navigate]);

  const instructors = useMemo(() => {
    const seen = new Map<string, string>();
    learners?.forEach((l) => seen.set(l.instructor.id, l.instructor.name));
    return [...seen].sort((a, b) => a[1].localeCompare(b[1]));
  }, [learners]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (learners ?? [])
      .filter((l) => !instructor || l.instructor.id === instructor)
      .filter((l) => !q || (l.name || "").toLowerCase().includes(q) || l.phone.includes(q))
      .sort((a, b) => (a.name || a.phone).localeCompare(b.name || b.phone));
  }, [learners, instructor, search]);

  function pickInstructor(id: string) {
    const next = new URLSearchParams(params);
    if (id) next.set("instructor", id);
    else next.delete("instructor");
    next.delete("learner");
    setParams(next, { replace: true });
  }

  const key = (l: SchoolLearner) => `${l.instructor.id}:${l.phone}`;

  return (
    <DashboardLayout title="Learners" subtitle="Everyone learning with your school">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search by name or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select
            aria-label="Instructor"
            value={instructor}
            onChange={(e) => pickInstructor(e.target.value)}
            className="h-10 rounded-md border bg-white px-3 text-sm sm:w-56"
          >
            <option value="">All instructors</option>
            {instructors.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {error ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{error}</CardContent></Card>
        ) : learners === null ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
        ) : shown.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
              <Users className="h-8 w-8 text-slate-300" />
              {learners.length === 0 ? "No learners yet. They appear here once they sign up with one of your instructors on WhatsApp." : "No learners match."}
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <p className="border-b bg-slate-50 px-4 py-2 text-xs text-muted-foreground">
              {shown.length} learner{shown.length === 1 ? "" : "s"}
            </p>
            <ul className="divide-y">
              {shown.map((l) => (
                <li key={key(l)}>
                  <button
                    onClick={() => setOpen(open === key(l) || open === l.phone ? null : key(l))}
                    aria-expanded={open === key(l) || open === l.phone}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name || l.phone}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {l.instructor.name} · {l.lessonsCompleted} lesson{l.lessonsCompleted === 1 ? "" : "s"} done
                        {l.nextLesson ? ` · next ${shortDate(l.nextLesson.date)} ${l.nextLesson.time}` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">{PROGRESS[l.progressLevel]}</Badge>
                    {l.paymentStatus === "owes" && <Badge variant="outline" className="shrink-0 border-red-300 text-red-700">Owes £{l.outstanding}</Badge>}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open === key(l) || open === l.phone ? "rotate-180" : ""}`} />
                  </button>
                  {(open === key(l) || open === l.phone) && <LearnerPanel learner={l} token={token!} />}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

/** Notes for the instructor, a WhatsApp link, and their recent lessons. */
function LearnerPanel({ learner: l, token }: { learner: SchoolLearner; token: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notes, setNotes] = useState(l.instructorNotes || "");
  const [saved, setSaved] = useState(l.instructorNotes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLearnerDetail(token, l.phone, l.instructor.id).then(setDetail).catch(() => {});
  }, [token, l.phone, l.instructor.id]);

  async function saveNotes() {
    if (notes === saved) return;
    setSaving(true);
    try {
      await updateLearnerNotes(token, l.phone, notes, l.instructor.id);
      setSaved(notes);
      toast.success(`Notes saved. ${l.instructor.name.split(" ")[0]} will see them too.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the notes");
    } finally {
      setSaving(false);
    }
  }

  const lessons = (detail?.lessons ?? []).slice(0, 5);

  return (
    <div className="space-y-4 border-t bg-slate-50/60 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">{l.phone.startsWith("+") ? l.phone : `+${l.phone}`}</span>
        {l.postalCode && <span className="text-muted-foreground">· {l.postalCode}</span>}
        <span className="text-muted-foreground">· Paid £{l.totalPaid}{l.outstanding > 0 ? `, owes £${l.outstanding}` : ""}</span>
        <Button asChild size="sm" variant="outline" className="ml-auto">
          <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-1.5 h-4 w-4 text-green-600" /> WhatsApp
          </a>
        </Button>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`notes-${l.phone}`} className="text-sm font-medium">Notes</label>
        <Textarea
          id={`notes-${l.phone}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          placeholder={`Notes about this learner, shared with ${l.instructor.name.split(" ")[0]}`}
          className="bg-white"
        />
        <p className="text-xs text-muted-foreground">{saving ? "Saving…" : notes !== saved ? "Saves when you click away" : "Shared with their instructor"}</p>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium">Recent lessons</p>
        {!detail ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : lessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">No lessons yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {lessons.map((b, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-24 shrink-0 tabular-nums text-muted-foreground">{shortDate(b.date)} {b.time}</span>
                <span className="min-w-0 flex-1 truncate">{b.lessonTypeName || "Lesson"}{b.progressNotes ? ` · ${b.progressNotes}` : ""}</span>
                <Badge variant="outline" className="shrink-0 capitalize">{b.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
