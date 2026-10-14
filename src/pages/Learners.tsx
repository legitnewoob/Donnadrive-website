import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getLearners, getLearnerDetail, updateLearnerNotes, getLessonTypes, getProfile, getSchool, type SchoolMember } from "@/lib/api";
import LearnerScheduling from "@/components/LearnerScheduling";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Star,
  Loader2,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

type Learner = Awaited<ReturnType<typeof getLearners>>[number];
type LearnerDetail = Awaited<ReturnType<typeof getLearnerDetail>>;

const progressColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  active: "bg-amber-100 text-amber-700",
  "test-ready": "bg-green-100 text-green-700",
};

const progressLabels: Record<string, string> = {
  new: "New",
  active: "Active",
  "test-ready": "Test Ready",
};

// Learner numbers are stored without "+", e.g. 447712345678
function dialable(phone: string) {
  return phone.startsWith("+") ? phone : `+${phone}`;
}

function formatPhone(phone: string) {
  const m = /^\+?44(\d{4})(\d{6})$/.exec(phone);
  return m ? `+44 ${m[1]} ${m[2]}` : dialable(phone);
}

function CopyPhoneButton({ phone }: { phone: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(dialable(phone));
      setCopied(true);
      toast.success("Number copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy — long-press the number instead");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy phone number"
      title="Copy phone number"
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-slate-900 transition-colors"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function money(n: number) {
  return `£${Number.isInteger(n) ? n : n.toFixed(2)}`;
}

function formatLessonDate(next: { date: string; time: string }) {
  const d = new Date(`${next.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return `${next.date} ${next.time}`;
  const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return `${day}, ${next.time}`;
}

function LearnerBadges({ learner: l }: { learner: Learner }) {
  return (
    <>
      {l.donnaPaused && (
        <Badge variant="outline" className="border-amber-300 text-amber-700 whitespace-nowrap">Donna paused</Badge>
      )}
      {l.priority && (
        <Badge variant="outline" className="border-sky-300 text-sky-700">Priority</Badge>
      )}
      <Badge className={`${progressColors[l.progressLevel]} whitespace-nowrap`} variant="secondary">
        {progressLabels[l.progressLevel]}
      </Badge>
      <Badge variant={l.paymentStatus === "paid" ? "secondary" : "destructive"} className="whitespace-nowrap">
        {l.paymentStatus === "owes" ? `Owes ${money(l.outstanding)}` : l.credit > 0 ? `${money(l.credit)} credit` : "Paid"}
      </Badge>
    </>
  );
}

export default function Learners() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<LearnerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const notesTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lessonTypes, setLessonTypes] = useState<Awaited<ReturnType<typeof getLessonTypes>>>([]);
  // School owners can switch to an instructor's learners (?instructor=<id>), read-only
  const [searchParams, setSearchParams] = useSearchParams();
  const viewing = searchParams.get("instructor") || "";
  const [team, setTeam] = useState<SchoolMember[]>([]);
  const readOnly = !!viewing;
  const viewingName = team.find((m) => m.id === viewing)?.name;

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    getProfile(token)
      .then((p) => (p.school?.role === "owner" || p.school?.role === "manager" ? getSchool(token).then((s) => setTeam(s.members)) : undefined))
      .catch(() => {});
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setExpanded(null);
    setDetail(null);
    getLearners(token, undefined, viewing || undefined).then(setLearners).catch(console.error).finally(() => setLoading(false));
    if (!viewing) getLessonTypes(token).then(setLessonTypes).catch(console.error);
  }, [token, viewing]);

  const filtered = learners.filter((l) => {
    if (progressFilter !== "all" && l.progressLevel !== progressFilter) return false;
    if (paymentFilter !== "all" && l.paymentStatus !== paymentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!(l.name || "").toLowerCase().includes(q) && !l.phone.includes(q)) return false;
    }
    return true;
  });

  async function toggleExpand(phone: string) {
    if (expanded === phone) {
      setExpanded(null);
      setDetail(null);
      return;
    }
    setExpanded(phone);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await getLearnerDetail(token!, phone, viewing || undefined);
      setDetail(d);
      setNotes(d.instructorNotes || "");
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  }

  function handleNotesChange(value: string) {
    if (readOnly) return;
    setNotes(value);
    if (notesTimeout.current) clearTimeout(notesTimeout.current);
    notesTimeout.current = setTimeout(async () => {
      setSavingNotes(true);
      try {
        await updateLearnerNotes(token!, expanded!, value);
      } catch (e) {
        console.error(e);
      } finally {
        setSavingNotes(false);
      }
    }, 800);
  }

  function initials(name: string | null) {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <DashboardLayout title="Learners" subtitle={viewingName ? `Viewing ${viewingName}'s learners` : undefined}>
      {team.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Viewing:</span>
          {[{ id: "", name: "My learners" }, ...team].map((m) => (
            <Button
              key={m.id || "me"}
              size="sm"
              variant={viewing === m.id ? "default" : "outline"}
              onClick={() => setSearchParams(m.id ? { instructor: m.id } : {})}
            >
              {m.name}
            </Button>
          ))}
        </div>
      )}
      {readOnly && (
        <p className="mb-4 rounded-lg bg-sky-50 p-3 text-sm text-sky-800">
          You're viewing {viewingName || "an instructor"}'s learners. Notes and scheduling can only be changed by them.
        </p>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none]">
              {(["all", "new", "active", "test-ready"] as const).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  className="shrink-0"
                  variant={progressFilter === v ? "default" : "outline"}
                  onClick={() => setProgressFilter(v)}
                >
                  {v === "all" ? "All Levels" : progressLabels[v]}
                </Button>
              ))}
              <Button
                size="sm"
                className="shrink-0"
                variant={paymentFilter === "owes" ? "destructive" : "outline"}
                onClick={() => setPaymentFilter(paymentFilter === "owes" ? "all" : "owes")}
              >
                Owes
              </Button>
            </div>
          </div>

          {/* Learner list */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No learners found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {learners.length === 0
                    ? "Learners will appear here once they register via WhatsApp"
                    : "Try adjusting your search or filters"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((l) => {
                const isExpanded = expanded === l.phone;
                return (
                  <Card key={l.phone} className="overflow-hidden">
                    {/* Summary row */}
                    <button
                      onClick={() => toggleExpand(l.phone)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {initials(l.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-x-2 flex-wrap">
                          <span className="font-medium text-slate-900 truncate max-w-full">{l.name || formatPhone(l.phone)}</span>
                          {l.name && <span className="text-xs text-slate-400">{formatPhone(l.phone)}</span>}
                        </div>
                        <div className="flex items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-500 flex-wrap">
                          <span>{l.lessonsCompleted} lesson{l.lessonsCompleted !== 1 ? "s" : ""}</span>
                          <span>{l.nextLesson ? `Next: ${formatLessonDate(l.nextLesson)}` : "No upcoming"}</span>
                        </div>
                        {/* Badges sit under the name on phones so they never squeeze it */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 sm:hidden">
                          <LearnerBadges learner={l} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="hidden sm:flex items-center gap-2">
                          <LearnerBadges learner={l} />
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t bg-slate-50 p-4">
                        {detailLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                          </div>
                        ) : detail ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            {/* Left column */}
                            <div className="space-y-4">
                              {/* Profile */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Profile</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="col-span-2 flex items-center gap-1.5">
                                    <span className="text-slate-400">Phone:</span>
                                    <span>{formatPhone(detail.phone)}</span>
                                    <CopyPhoneButton phone={detail.phone} />
                                  </div>
                                  <div><span className="text-slate-400">Age:</span> {detail.age ?? "—"}</div>
                                  <div><span className="text-slate-400">DOB:</span> {detail.dob ?? "—"}</div>
                                  <div><span className="text-slate-400">Postal:</span> {detail.postalCode ?? "—"}</div>
                                  <div><span className="text-slate-400">Joined:</span> {detail.createdAt ? new Date(detail.createdAt).toLocaleDateString("en-GB") : "—"}</div>
                                </div>
                              </div>

                              {/* Notes */}
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-sm font-semibold text-slate-700">Notes</h4>
                                  {savingNotes && <span className="text-xs text-slate-400">Saving...</span>}
                                </div>
                                <Textarea
                                  placeholder="Add notes about this learner..."
                                  value={notes}
                                  onChange={(e) => handleNotesChange(e.target.value)}
                                  rows={3}
                                  className="bg-white"
                                  readOnly={readOnly}
                                />
                              </div>

                              {/* Scheduling (the instructor's own controls) */}
                              {!readOnly && (
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Scheduling</h4>
                                <LearnerScheduling
                                  key={detail.phone}
                                  token={token!}
                                  phone={detail.phone}
                                  initial={detail.schedulingPrefs}
                                  lessonTypes={lessonTypes}
                                  onSaved={(prefs) =>
                                    setLearners((prev) =>
                                      prev.map((x) =>
                                        x.phone === detail.phone ? { ...x, priority: prefs.priority, donnaPaused: prefs.donnaPaused } : x
                                      )
                                    )
                                  }
                                />
                              </div>
                              )}

                              {/* Financial summary */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Payments</h4>
                                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                                  <div className="bg-white rounded-lg p-2">
                                    <div className="font-semibold text-slate-900">{money(detail.totalPaid)}</div>
                                    <div className="text-xs text-slate-400">Paid</div>
                                  </div>
                                  <div className="bg-white rounded-lg p-2">
                                    <div className="font-semibold text-slate-900">{money(detail.totalCharged)}</div>
                                    <div className="text-xs text-slate-400">Charged</div>
                                  </div>
                                  {detail.credit > 0 ? (
                                    <div className="bg-white rounded-lg p-2">
                                      <div className="font-semibold text-green-600">{money(detail.credit)}</div>
                                      <div className="text-xs text-slate-400">In credit</div>
                                    </div>
                                  ) : (
                                    <div className="bg-white rounded-lg p-2">
                                      <div className={`font-semibold ${detail.outstanding > 0 ? "text-red-600" : "text-green-600"}`}>
                                        {money(detail.outstanding)}
                                      </div>
                                      <div className="text-xs text-slate-400">Outstanding</div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* WhatsApp link */}
                              <a
                                href={`https://wa.me/${l.phone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-fit"
                              >
                                <Button variant="outline" size="sm" className="gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  Message on WhatsApp
                                </Button>
                              </a>
                            </div>

                            {/* Right column — history */}
                            <div className="space-y-4">
                              {/* Lesson history */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                  Lesson History ({detail.lessons.length})
                                </h4>
                                <div className="space-y-2 sm:max-h-64 sm:overflow-y-auto sm:pr-1">
                                  {detail.lessons.length === 0 ? (
                                    <p className="text-sm text-slate-400">No lessons yet</p>
                                  ) : (
                                    detail.lessons.map((lesson) => (
                                      <div key={lesson.bookingId} className="bg-white rounded-lg p-3 text-sm">
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="font-medium">{formatLessonDate(lesson)}</span>
                                          <div className="flex flex-wrap items-center justify-end gap-1">
                                            {lesson.lateCancellation && (
                                              <Badge variant="outline" className="text-xs border-red-300 text-red-700">Late cancel</Badge>
                                            )}
                                            <Badge variant="secondary" className="text-xs capitalize">{lesson.status}</Badge>
                                          </div>
                                        </div>
                                        {lesson.lessonTypeName && (
                                          <p className="text-xs text-slate-500 mt-0.5">
                                            {lesson.lessonTypeName}{lesson.price != null ? ` · £${lesson.price}` : ""}
                                          </p>
                                        )}
                                        {lesson.topicsCovered.length > 0 && (
                                          <div className="flex gap-1 flex-wrap mt-1">
                                            {lesson.topicsCovered.map((t) => (
                                              <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                                            ))}
                                          </div>
                                        )}
                                        {lesson.rating && (
                                          <div className="flex items-center gap-0.5 mt-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`h-3 w-3 ${i < lesson.rating! ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                                              />
                                            ))}
                                          </div>
                                        )}
                                        {lesson.progressNotes && (
                                          <p className="text-xs text-slate-500 mt-1">{lesson.progressNotes}</p>
                                        )}
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>

                              {/* Payment history */}
                              <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                                  Payment History ({detail.payments.length})
                                </h4>
                                <div className="space-y-2 sm:max-h-48 sm:overflow-y-auto sm:pr-1">
                                  {detail.payments.length === 0 ? (
                                    <p className="text-sm text-slate-400">No payments yet</p>
                                  ) : (
                                    detail.payments.map((p) => (
                                      <div key={p.paymentId} className="bg-white rounded-lg p-3 text-sm flex items-center justify-between">
                                        <div>
                                          <span className="font-medium">{p.date}</span>
                                          <span className="text-slate-400 ml-2 capitalize">{p.method}</span>
                                          {p.note && <p className="text-xs text-slate-500 mt-0.5">{p.note}</p>}
                                        </div>
                                        <span className="font-semibold text-green-600">&pound;{p.amount}</span>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
