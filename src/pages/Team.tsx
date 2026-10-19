import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Users,
  Mail,
  Copy,
  X,
  Loader2,
  Power,
  Pencil,
  UserPlus,
  Plus,
  Minus,
  ShieldCheck,
  ChevronRight,
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
  setSchoolSeats,
  startSeatsCheckout,
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
    // Back from paying for seats: Stripe tells us a moment later, so check again shortly
    if (new URLSearchParams(window.location.search).get("seats") === "added") {
      window.history.replaceState({}, "", "/team");
      toast.success("Payment done. Your new seats will appear in a moment.");
      const timers = [3000, 8000].map((ms) => setTimeout(load, ms));
      return () => timers.forEach(clearTimeout);
    }
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

  async function confirmSeats() {
    if (seatChange === null) return;
    setSavingSeats(true);
    // No subscription yet: pay for the seats on Stripe's page, then come back here
    if (data?.school.seatsCheckout) {
      try {
        const { url } = await startSeatsCheckout(token!, seatChange - data.school.extraSeats);
        window.location.href = url;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Couldn't open the payment page");
        setSavingSeats(false);
      }
      return;
    }
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
                ) : can("school.billing") && data.school.seatsCheckout ? (
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
                {!data.school.canBuySeats && !data.school.seatsCheckout && (
                  <p className="mt-1 text-sm text-amber-800">Adding seats isn't available right now. Contact us and we'll add seats for you.</p>
                )}
              </div>
              {data.school.seatsCheckout ? (
                <Button className="shrink-0" onClick={() => setSeatChange(data.school.extraSeats + 1)}>
                  <Plus className="mr-1 h-4 w-4" /> Add a seat
                </Button>
              ) : !data.school.canBuySeats ? (
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

        {/* Instructors and pending invites, one row each */}
        <InstructorTable
          members={data.members}
          invites={data.invites}
          onOpen={(m) => navigate(`/team/${m.id}`)}
          onCopy={(link) => copy(link)}
          onCancel={can("school.invite") ? handleCancelInvite : undefined}
        />
      </div>

      <AlertDialog open={seatChange !== null} onOpenChange={(open) => !open && setSeatChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {seatChange !== null && seatChange > data.school.extraSeats ? "Add an instructor seat?" : "Remove an extra seat?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {seatChange !== null && (data.school.seatsCheckout ? (
                // No subscription yet: seats are paid for at checkout
                data.school.seatsCheckout === "seats_only" ? (
                  <>
                    You'll pay <strong>{gbp((seatChange - data.school.extraSeats) * data.school.extraSeatAmount)}/month</strong> for
                    {seatChange - data.school.extraSeats === 1 ? " the extra seat" : ` ${seatChange - data.school.extraSeats} extra seats`} by card. Your plan
                    itself stays free. We'll take you to our secure payment page.
                  </>
                ) : (
                  <>
                    This starts your Driving School subscription: <strong>{monthlyCost(data.school, seatChange)}/month</strong>
                    {costBreakdown(data.school, seatChange)}. We'll take you to our secure payment page.
                  </>
                )
              ) : data.school.trialEndsAt ? (
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
              {data.school.seatsCheckout
                ? "Continue to payment"
                : seatChange !== null && data.school.trialEndsAt && seatChange > data.school.extraSeats
                  ? `Pay ${gbp((seatChange - data.school.extraSeats) * data.school.extraSeatAmount)} and add`
                  : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </DashboardLayout>
  );
}

/** Instructors (joined) and invites (waiting) as a compact table; a row opens the instructor. */
function InstructorTable({
  members,
  invites,
  onOpen,
  onCopy,
  onCancel,
}: {
  members: SchoolMember[];
  invites: SchoolOverview["invites"];
  onOpen: (m: SchoolMember) => void;
  onCopy: (link: string) => void;
  onCancel?: (id: string) => void;
}) {
  const total = members.length + invites.length;
  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <Users className="h-4 w-4" /> Instructors ({members.length}){invites.length > 0 && <span className="text-sm font-normal text-muted-foreground">· {invites.length} invited</span>}
      </h3>
      <Card className="overflow-hidden">
        {total === 0 ? (
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No instructors yet. Invite your first one above.</CardContent>
        ) : (
          <table className="w-full text-sm">
            <thead className="hidden border-b bg-slate-50 text-left text-xs font-medium text-muted-foreground sm:table-header-group">
              <tr>
                <th className="px-4 py-2.5 font-medium">Instructor</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 text-right font-medium">Learners</th>
                <th className="px-3 py-2.5 text-right font-medium">This week</th>
                <th className="px-3 py-2.5 text-right font-medium">Upcoming</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {members.map((m) => (
                <tr key={m.id} onClick={() => onOpen(m)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-[11px] font-semibold text-white">
                        {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 truncate font-medium">
                          {m.name}
                          {m.role === "manager" && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-violet-600" aria-label="Manager" />}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                        {/* Phones: the numbers sit under the name */}
                        <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                          {m.learners} learner{m.learners === 1 ? "" : "s"} · {m.lessonsThisWeek} this week · {m.upcomingLessons} upcoming
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle"><MemberStatus member={m} /></td>
                  <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{m.learners}</td>
                  <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{m.lessonsThisWeek}</td>
                  <td className="hidden px-3 py-3 text-right tabular-nums sm:table-cell">{m.upcomingLessons}</td>
                  <td className="pr-3 text-slate-400"><ChevronRight className="h-4 w-4" /></td>
                </tr>
              ))}
              {invites.map((inv) => (
                <tr key={inv.id} className="bg-slate-50/40">
                  <td className="px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400">
                        <Mail className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{inv.email}</p>
                        <p className="text-xs text-muted-foreground">Expires {new Date(inv.expiresAt).toLocaleDateString("en-GB")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge variant="outline" className="border-amber-300 text-amber-700">Invited</Badge></td>
                  <td colSpan={3} className="hidden px-3 py-3 text-right sm:table-cell">
                    <Button size="sm" variant="ghost" onClick={() => onCopy(inv.link)} aria-label={`Copy invite link for ${inv.email}`}>
                      <Copy className="mr-1 h-3.5 w-3.5" /> Copy link
                    </Button>
                  </td>
                  <td className="pr-2">
                    <div className="flex justify-end">
                      <Button size="icon" variant="ghost" className="h-8 w-8 sm:hidden" onClick={() => onCopy(inv.link)} aria-label={`Copy invite link for ${inv.email}`}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      {onCancel && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onCancel(inv.id)} aria-label={`Cancel invite for ${inv.email}`}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

/** Ready with Donna on or off, or how far through setting up they are. */
export function MemberStatus({ member: m }: { member: SchoolMember }) {
  const steps = [m.setup?.complete, !!m.phoneNumber, m.calendarConnected].filter(Boolean).length;
  if (steps < 3) return <Badge variant="secondary" className="whitespace-nowrap">Setting up · {steps}/3</Badge>;
  return m.donnaEnabled ? (
    <Badge variant="outline" className="whitespace-nowrap border-green-300 text-green-700"><Power className="mr-1 h-3 w-3" /> Donna on</Badge>
  ) : (
    <Badge variant="outline" className="whitespace-nowrap border-red-300 text-red-700"><Power className="mr-1 h-3 w-3" /> Donna off</Badge>
  );
}
