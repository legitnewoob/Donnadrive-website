import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Mail,
  Copy,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Calendar,
  Power,
  Pencil,
  UserPlus,
  Plus,
  Minus,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  renameSchool,
  inviteInstructor,
  cancelSchoolInvite,
  removeSchoolMember,
  setSchoolSeats,
  setSchoolMemberRole,
  type SchoolOverview,
  type SchoolMember,
} from "@/lib/api";

const gbp = (pence: number) => `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`;
const monthlyCost = (school: SchoolOverview["school"], extraSeats: number) => gbp(school.planAmount + extraSeats * school.extraSeatAmount);
const costBreakdown = (school: SchoolOverview["school"], extraSeats: number) =>
  extraSeats > 0 ? ` (${gbp(school.planAmount)} + ${extraSeats} × ${gbp(school.extraSeatAmount)})` : "";

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Invite link copied");
  } catch {
    toast.error("Couldn't copy, select the link and copy it instead");
  }
};

export default function Team() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [data, setData] = useState<SchoolOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [removing, setRemoving] = useState<SchoolMember | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  // Seat change waiting for the owner to confirm the new price
  const [seatChange, setSeatChange] = useState<number | null>(null);
  const [savingSeats, setSavingSeats] = useState(false);

  async function load() {
    try {
      const d = await getSchool(token!);
      setData(d);
      setName(d.school.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your school");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    try {
      const result = await inviteInstructor(token!, email.trim());
      setLastLink(result.link);
      setEmail("");
      toast.success(
        result.alreadySent
          ? `${result.email} was already invited. Here's their link again.`
          : result.emailed
            ? `Invite emailed to ${result.email}`
            : `Invite created for ${result.email}. Send them the link below.`
      );
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleCancelInvite(id: string) {
    try {
      await cancelSchoolInvite(token!, id);
      toast.success("Invite cancelled, seat freed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't cancel the invite");
    }
  }

  async function handleRemove() {
    if (!removing) return;
    try {
      await removeSchoolMember(token!, removing.id);
      toast.success(`${removing.name} has been removed from your school`);
      setRemoving(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove the instructor");
    }
  }

  async function confirmSeats() {
    if (seatChange === null) return;
    setSavingSeats(true);
    try {
      const d = await setSchoolSeats(token!, seatChange);
      setData(d);
      toast.success(`You now have ${d.school.seatLimit} instructor seats.`);
      setSeatChange(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change seats");
    } finally {
      setSavingSeats(false);
    }
  }

  async function handleRole(member: SchoolMember, role: "manager" | "instructor") {
    try {
      const r = await setSchoolMemberRole(token!, member.id, role);
      toast.success(`${member.name} is now ${role === "manager" ? "a manager" : "an instructor"}`);
      setData((d) => d && { ...d, members: d.members.map((m) => (m.id === member.id ? { ...m, role: r.role as SchoolMember["role"], roleLabel: r.roleLabel } : m)) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change the role");
    }
  }

  async function handleRename() {
    try {
      const d = await renameSchool(token!, name.trim());
      setData(d);
      setEditingName(false);
      toast.success("School name updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't rename");
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Team">
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
      </DashboardLayout>
    );
  }

  const can = (p: string) => !!data?.permissions?.includes(p);

  if (!data || !can("school.viewAll")) {
    return (
      <DashboardLayout title="Team">
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {error || (data ? `You're an instructor at ${data.school.name}. Your school owner manages the team.` : "The Team page is part of the Driving School plan.")}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { seats } = data;
  const seatsFull = seats.used >= seats.limit;

  return (
    <DashboardLayout title="Team" subtitle={data.school.name}>
      <div className="max-w-4xl space-y-6">
        {/* School + seats */}
        <Card>
          <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex gap-2">
                  <Input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className="max-w-xs" autoFocus />
                  <Button size="sm" onClick={handleRename} disabled={!name.trim()}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setName(data.school.name); }}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold">{data.school.name}</h2>
                  {can("school.rename") && (
                    <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-slate-700" aria-label="Rename school">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {can("school.billing")
                  ? <>Driving School plan · {monthlyCost(data.school, data.school.extraSeats)}/month{costBreakdown(data.school, data.school.extraSeats)} · {seats.limit} instructor seats</>
                  : <>You're a manager · {data.owner?.name || "The owner"} handles billing and seats</>}
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{seats.used}</span>
                <span className="text-muted-foreground">/ {seats.limit} seats used</span>
              </div>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: seats.limit }).map((_, i) => (
                  <span key={i} className={`h-2 w-8 rounded-full ${i < seats.members ? "bg-sky-600" : i < seats.used ? "bg-sky-300" : "bg-slate-200"}`} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invite */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base"><UserPlus className="h-4 w-4 text-sky-600" /> Invite an instructor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {seatsFull ? (
              <div className="flex flex-col gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 sm:flex-row sm:items-center">
                <p className="flex-1">
                  All {seats.limit} seats are in use. {can("school.billing") ? "Add a seat for another instructor, or remove one to free a seat." : "Ask the owner to add a seat, or remove an instructor to free one."}
                </p>
                {data.school.canBuySeats ? (
                  <Button size="sm" onClick={() => setSeatChange(data.school.extraSeats + 1)}>
                    <Plus className="mr-1 h-4 w-4" /> Add a seat · {gbp(data.school.extraSeatAmount)}/month
                  </Button>
                ) : can("school.billing") && (
                  <Button size="sm" variant="outline" onClick={() => navigate("/contact")}>Contact us to add seats</Button>
                )}
              </div>
            ) : (
              <form onSubmit={handleInvite} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="email"
                  placeholder="instructor@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={inviting || !email.trim()}>
                  {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                  Send invite
                </Button>
              </form>
            )}
            <p className="text-xs text-muted-foreground">
              They'll sign in with Google using this email, then set up their own Donna. The school's plan covers them.
            </p>
            {lastLink && (
              <div className="flex items-center gap-2 rounded-lg border bg-slate-50 p-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-mono text-xs">{lastLink}</span>
                <Button size="sm" variant="outline" onClick={() => copy(lastLink)}><Copy className="mr-1 h-3.5 w-3.5" /> Copy</Button>
              </div>
            )}
            {data.invites.length > 0 && (
              <ul className="divide-y rounded-lg border">
                {data.invites.map((inv) => (
                  <li key={inv.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">Invited · expires {new Date(inv.expiresAt).toLocaleDateString("en-GB")}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copy(inv.link)} aria-label={`Copy invite link for ${inv.email}`}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleCancelInvite(inv.id)} aria-label={`Cancel invite for ${inv.email}`}>
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Seats: the owner can add more on top of the ones included */}
        {can("school.billing") && (
          <Card>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-medium">Instructor seats</p>
                <p className="text-sm text-muted-foreground">
                  {data.school.includedSeats} included in your plan · extra seats {gbp(data.school.extraSeatAmount)}/month each
                </p>
                {data.school.canBuySeats && data.school.trialEndsAt && (
                  <p className="mt-1 text-sm text-sky-800">
                    On your free trial: a new seat is {gbp(data.school.extraSeatAmount)} now, then joins your monthly payment when the trial ends.
                  </p>
                )}
                {!data.school.canBuySeats && (
                  <p className="mt-1 text-sm text-amber-800">
                    {data.school.seatsUnavailable === "no_subscription"
                      ? "Extra seats are added to your monthly subscription, and your school isn't on a paid subscription yet. Contact us and we'll add seats for you."
                      : "Adding seats isn't available right now. Contact us and we'll add seats for you."}
                  </p>
                )}
              </div>
              {!data.school.canBuySeats ? (
                <Button variant="outline" className="shrink-0" onClick={() => navigate("/contact")}>Contact us</Button>
              ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Remove an extra seat"
                  disabled={data.school.extraSeats === 0}
                  onClick={() => setSeatChange(data.school.extraSeats - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-24 text-center text-sm">
                  <strong>{data.school.extraSeats}</strong> extra
                </span>
                <Button size="icon" variant="outline" aria-label="Add an extra seat" onClick={() => setSeatChange(data.school.extraSeats + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructors */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Instructors ({data.members.length})</h3>
          {data.members.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">No instructors yet. Invite your first one above.</CardContent></Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.members.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  onView={() => navigate(`/learners?instructor=${m.id}`)}
                  // Managers remove instructors; only the owner removes a manager
                  onRemove={can("school.remove") && (m.role !== "manager" || can("school.roles")) ? () => setRemoving(m) : undefined}
                  onRole={can("school.roles") ? (role) => handleRole(m, role) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={seatChange !== null} onOpenChange={(open) => !open && setSeatChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {seatChange !== null && seatChange > data.school.extraSeats ? "Add an instructor seat?" : "Remove an extra seat?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {seatChange !== null && (data.school.trialEndsAt ? (
                // On the free trial: new seats are paid for now; the monthly payment starts when the trial ends
                seatChange > data.school.extraSeats ? (
                  <>
                    We'll charge <strong>{gbp((seatChange - data.school.extraSeats) * data.school.extraSeatAmount)} now</strong> for the new seat
                    {seatChange - data.school.extraSeats === 1 ? "" : "s"}, so you can invite another instructor straight away. When your free
                    trial ends on <strong>{new Date(data.school.trialEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}</strong>,
                    you'll pay <strong>{monthlyCost(data.school, seatChange)}/month</strong>
                    {costBreakdown(data.school, seatChange)}.
                  </>
                ) : (
                  <>
                    You'll have {data.school.includedSeats + seatChange} instructor seats. After your free trial you'll pay{" "}
                    <strong>{monthlyCost(data.school, seatChange)}/month</strong>
                    {costBreakdown(data.school, seatChange)}. What you paid for the seat during the trial isn't refunded.
                  </>
                )
              ) : (
                <>
                  You'll have {data.school.includedSeats + seatChange} instructor seats and pay{" "}
                  <strong>{monthlyCost(data.school, seatChange)}/month</strong>
                  {costBreakdown(data.school, seatChange)}. The difference for this month is charged or credited
                  on your next invoice.
                </>
              ))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingSeats}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmSeats(); }} disabled={savingSeats}>
              {savingSeats && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {seatChange !== null && data.school.trialEndsAt && seatChange > data.school.extraSeats
                ? `Pay ${gbp((seatChange - data.school.extraSeats) * data.school.extraSeatAmount)} and add`
                : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their WhatsApp number will be released and Donna will stop booking for them. They keep their account, learners
              and history on the free plan. This frees a seat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function Check({ done, label, icon: Icon }: { done: boolean; label: string; icon: React.ElementType }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${done ? "text-green-700" : "text-slate-400"}`}>
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

function MemberCard({
  member: m,
  onView,
  onRemove,
  onRole,
}: {
  member: SchoolMember;
  onView: () => void;
  onRemove?: () => void;
  onRole?: (role: "manager" | "instructor") => void;
}) {
  const ready = m.setup.complete || !!m.phoneNumber;
  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-semibold text-white">
            {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate font-medium">
              {m.name}
              {m.role === "manager" && (
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                  <ShieldCheck className="mr-1 h-3 w-3" /> Manager
                </Badge>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">{m.email}</p>
          </div>
          {m.phoneNumber ? (
            <Badge
              variant="outline"
              className={m.donnaEnabled ? "border-green-300 text-green-700" : "border-red-300 text-red-700"}
            >
              <Power className="mr-1 h-3 w-3" /> {m.donnaEnabled ? "Donna on" : "Donna off"}
            </Badge>
          ) : (
            <Badge variant="secondary">Setting up</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Check done={ready} label="Settings" icon={AlertCircle} />
          <Check done={!!m.phoneNumber} label={m.phoneNumber || "Number"} icon={Phone} />
          <Check done={m.calendarConnected} label="Calendar" icon={Calendar} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat value={m.learners} label="Learners" />
          <Stat value={m.lessonsThisWeek} label="This week" />
          <Stat value={m.upcomingLessons} label="Upcoming" />
        </div>

        {onRole && (
          <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">Role</p>
              <p className="text-[11px] text-muted-foreground">
                {m.role === "manager" ? "Can invite and remove instructors and see everyone's learners" : "Sees only their own learners"}
              </p>
            </div>
            <select
              aria-label={`Role for ${m.name}`}
              value={m.role === "manager" ? "manager" : "instructor"}
              onChange={(e) => onRole(e.target.value as "manager" | "instructor")}
              className="h-8 shrink-0 rounded-md border bg-white px-2 text-sm"
            >
              <option value="instructor">Instructor</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onView}>View learners</Button>
          {onRemove && (
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onRemove}>Remove</Button>
          )}
        </div>
      </CardContent>
    </Card>
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
