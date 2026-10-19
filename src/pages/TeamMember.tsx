import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Calendar, CheckCircle2, Circle, Loader2, Phone, Plus, SlidersHorizontal, Trash2, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getSchool,
  getLearners,
  getLessonTypes,
  createLessonType,
  updateLessonType,
  deleteLessonType,
  removeSchoolMember,
  setSchoolMemberRole,
  type SchoolMember,
  type SchoolOverview,
  type LearnerSummary,
} from "@/lib/api";
import { MemberStatus } from "@/pages/Team";

type LessonType = Awaited<ReturnType<typeof getLessonTypes>>[number];

/**
 * One instructor in a driving school, for the owner (or a manager): how they're
 * getting on, their lesson types and prices (which the school can change), their
 * learners, and their role.
 */
export default function TeamMember() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [school, setSchool] = useState<SchoolOverview | null>(null);
  const [error, setError] = useState("");
  const [types, setTypes] = useState<LessonType[] | null>(null);
  const [learners, setLearners] = useState<LearnerSummary[] | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const member = school?.members.find((m) => m.id === id) ?? null;
  const can = (p: string) => !!school?.permissions.includes(p);

  const loadTypes = useCallback(() => {
    if (token) getLessonTypes(token, id).then(setTypes).catch(() => setTypes([]));
  }, [token, id]);

  useEffect(() => {
    if (!token) return navigate("/");
    getSchool(token).then(setSchool).catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your school"));
    loadTypes();
    getLearners(token, undefined, id).then(setLearners).catch(() => setLearners([]));
  }, [token, id, navigate, loadTypes]);

  async function changeRole(role: "manager" | "instructor") {
    if (!member) return;
    try {
      const r = await setSchoolMemberRole(token!, member.id, role);
      setSchool((s) => s && { ...s, members: s.members.map((m) => (m.id === member.id ? { ...m, role: r.role as SchoolMember["role"], roleLabel: r.roleLabel } : m)) });
      toast.success(`${member.name} is now ${role === "manager" ? "a manager" : "an instructor"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't change the role");
    }
  }

  async function remove() {
    if (!member) return;
    try {
      await removeSchoolMember(token!, member.id);
      toast.success(`${member.name} has been removed from your school`);
      navigate("/team");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove the instructor");
    }
  }

  const back = (
    <Link to="/team" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> Team
    </Link>
  );

  if (error || (school && !member)) {
    return (
      <DashboardLayout title="Instructor">
        {back}
        <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">{error || "This instructor isn't in your school."}</CardContent></Card>
      </DashboardLayout>
    );
  }
  if (!member) {
    return (
      <DashboardLayout title="Instructor">
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
      </DashboardLayout>
    );
  }

  const canManage = can("school.manage");
  const canRemove = can("school.remove") && (member.role !== "manager" || can("school.roles"));

  return (
    <DashboardLayout title={member.name} subtitle={member.email}>
      <div className="mx-auto max-w-4xl space-y-4">
        {back}

        {/* How they're getting on */}
        <Card>
          <CardContent className="space-y-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{member.roleLabel || "Instructor"}</p>
              <MemberStatus member={member} />
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5">
              <Step done={!!member.setup?.complete} label="Donna settings" icon={SlidersHorizontal} />
              <Step done={!!member.phoneNumber} label={member.phoneNumber || "WhatsApp number"} icon={Phone} />
              <Step done={member.calendarConnected} label="Google Calendar" icon={Calendar} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat value={member.learners} label="Learners" />
              <Stat value={member.lessonsThisWeek} label="Lessons this week" />
              <Stat value={member.upcomingLessons} label="Upcoming" />
            </div>
          </CardContent>
        </Card>

        <LessonTypes
          types={types}
          editable={canManage}
          instructorId={member.id}
          token={token!}
          onChange={loadTypes}
        />

        {/* Their learners */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-sky-600" /> Learners</CardTitle>
            <Button size="sm" variant="outline" onClick={() => navigate(`/school/learners?instructor=${member.id}`)}>Open all</Button>
          </CardHeader>
          <CardContent>
            {learners === null ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : learners.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No learners yet.</p>
            ) : (
              <ul className="divide-y">
                {learners.slice(0, 8).map((l) => (
                  <li key={l.phone}>
                    <button
                      onClick={() => navigate(`/school/learners?instructor=${member.id}&learner=${encodeURIComponent(l.phone)}`)}
                      className="flex w-full items-center gap-3 py-2.5 text-left hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.name || l.phone}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {l.lessonsCompleted} lesson{l.lessonsCompleted === 1 ? "" : "s"} done
                          {l.nextLesson ? ` · next ${new Date(l.nextLesson.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} ${l.nextLesson.time}` : ""}
                        </p>
                      </div>
                      {l.paymentStatus === "owes" && <Badge variant="outline" className="border-red-300 text-red-700">Owes £{l.outstanding}</Badge>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {learners && learners.length > 8 && (
              <p className="pt-2 text-center text-xs text-muted-foreground">and {learners.length - 8} more</p>
            )}
          </CardContent>
        </Card>

        {/* Role and removing them */}
        {(can("school.roles") || canRemove) && (
          <Card>
            <CardContent className="space-y-3 py-4">
              {can("school.roles") && (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Role</p>
                    <p className="text-xs text-muted-foreground">
                      {member.role === "manager" ? "Can invite and remove instructors and see everyone's learners" : "Sees only their own learners"}
                    </p>
                  </div>
                  <select
                    aria-label={`Role for ${member.name}`}
                    value={member.role === "manager" ? "manager" : "instructor"}
                    onChange={(e) => changeRole(e.target.value as "manager" | "instructor")}
                    className="h-9 shrink-0 rounded-md border bg-white px-2 text-sm"
                  >
                    <option value="instructor">Instructor</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              )}
              {canRemove && (
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                  <p className="text-sm text-muted-foreground">Removing them frees a seat. They keep their account and learners on the free plan.</p>
                  <Button variant="ghost" className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setConfirmRemove(true)}>
                    Remove
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {member.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their WhatsApp number will be released and Donna will stop booking for them. They keep their account, learners
              and history on the free plan. This frees a seat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

/** The instructor's lesson types and prices; the school can add, change and remove them. */
function LessonTypes({
  types,
  editable,
  instructorId,
  token,
  onChange,
}: {
  types: LessonType[] | null;
  editable: boolean;
  instructorId: string;
  token: string;
  onChange: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  async function run(action: () => Promise<unknown>, done: string) {
    setSaving(true);
    try {
      await action();
      toast.success(done);
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(price);
    if (!name.trim() || !(amount > 0)) return toast.error("Give it a name and a price");
    await run(() => createLessonType(token, { name: name.trim(), price: amount }, instructorId), "Lesson type added");
    setName("");
    setPrice("");
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lesson types and prices</CardTitle>
        {editable && <p className="text-sm text-muted-foreground">Changes apply to this instructor straight away; Donna uses these prices with their learners.</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {types === null ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : types.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No lesson types yet.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {types.map((t) => (
              <li key={t._id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${t.active ? "" : "text-muted-foreground line-through"}`}>{t.name}</p>
                  {t.description && <p className="truncate text-xs text-muted-foreground">{t.description}</p>}
                </div>
                {editable ? (
                  <>
                    <div className="relative w-24 shrink-0">
                      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                      <Input
                        type="number"
                        min="1"
                        step="0.5"
                        defaultValue={t.price}
                        aria-label={`Price for ${t.name}`}
                        className="h-9 pl-6"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (v > 0 && v !== t.price) run(() => updateLessonType(token, t._id, { price: v }, instructorId), `${t.name} is now £${v}`);
                        }}
                      />
                    </div>
                    <Switch
                      checked={t.active}
                      disabled={saving}
                      aria-label={`${t.active ? "Hide" : "Offer"} ${t.name}`}
                      onCheckedChange={(on) => run(() => updateLessonType(token, t._id, { active: on }, instructorId), on ? `${t.name} is offered again` : `${t.name} is hidden`)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-600"
                      disabled={saving}
                      aria-label={`Delete ${t.name}`}
                      onClick={() => run(() => deleteLessonType(token, t._id, instructorId), `${t.name} deleted`)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <span className="shrink-0 text-sm font-semibold">£{t.price}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {editable && (
          <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="New lesson type, e.g. Motorway" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <div className="relative sm:w-28">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
              <Input type="number" min="1" step="0.5" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-6" />
            </div>
            <Button type="submit" variant="outline" disabled={saving}><Plus className="mr-1 h-4 w-4" /> Add</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Step({ done, label, icon: Icon }: { done: boolean; label: string; icon: React.ElementType }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${done ? "text-green-700" : "text-slate-500"}`}>
      {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4 text-slate-300" />}
      <Icon className="h-3.5 w-3.5 opacity-60" />
      {label}
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
