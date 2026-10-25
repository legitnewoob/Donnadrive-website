import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Circle, Loader2, PartyPopper, Power, UserPlus, Users } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getProfile, getSchool, setSchoolDonna, type SchoolMember, type SchoolOverview } from "@/lib/api";

// Ready = settings filled in, WhatsApp number and calendar connected
const isReady = (m: SchoolMember) => m.setup?.complete && !!m.phoneNumber && m.calendarConnected;

/**
 * Home for driving school owners. They don't run Donna themselves: they add
 * instructors, see how each one is getting on, and have a switch that turns
 * Donna off for everyone at once.
 */
export default function SchoolHome() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [data, setData] = useState<SchoolOverview | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmOff, setConfirmOff] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/dashboard", { replace: true });
      return;
    }
    getProfile(token).then((p) => setName(p.name)).catch(() => {});
    getSchool(token)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Couldn't load your school"));
  }, [token, navigate]);

  async function changeDonna(enabled: boolean) {
    if (!token) return;
    setSaving(true);
    try {
      setData(await setSchoolDonna(token, enabled));
      toast.success(enabled ? "Donna is back on for all your instructors." : "Donna is off for all your instructors.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't change Donna");
    } finally {
      setSaving(false);
      setConfirmOff(false);
    }
  }

  const firstName = name.split(" ")[0] || "there";
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "DS";

  if (error) {
    return (
      <DashboardLayout title="Your school" initials={initials}>
        <Card className="mx-auto max-w-lg">
          <CardContent className="py-8 text-center text-muted-foreground">{error}</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="Your school" initials={initials}>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    );
  }

  const { onboarding, members } = data;
  const canSwitch = data.permissions.includes("school.donna");
  const on = data.donnaEnabled;

  return (
    <DashboardLayout title={`Welcome, ${firstName}!`} subtitle={data.school.name} initials={initials}>
      <div className="mx-auto max-w-4xl space-y-4">
        {/* The school-wide switch */}
        <Card className={on ? "border-green-200 bg-green-50/40" : "border-red-300 bg-red-50/60"}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${on ? "bg-green-100" : "bg-red-100"}`}>
                <Power className={`h-5 w-5 ${on ? "text-green-600" : "text-red-600"}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{on ? "Donna is on for your school" : "Donna is off for your whole school"}</p>
                <p className="text-sm text-muted-foreground">
                  {on
                    ? "She replies for every instructor who has finished setting her up."
                    : "Learners are told to contact their instructor directly. Turn her back on any time."}
                </p>
              </div>
              <Switch
                checked={on}
                disabled={saving || !canSwitch}
                onCheckedChange={(next) => (next ? changeDonna(true) : setConfirmOff(true))}
                aria-label={on ? "Turn Donna off for the whole school" : "Turn Donna on for the whole school"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Getting the school set up, or done */}
        {onboarding.complete ? (
          <Card className="border-green-200">
            <CardContent className="flex items-center gap-3 py-4">
              <PartyPopper className="h-6 w-6 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="font-semibold">Your school is set up</p>
                <p className="text-sm text-muted-foreground">
                  {onboarding.readyCount} instructor{onboarding.readyCount === 1 ? " has" : "s have"} Donna ready to take bookings.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-sky-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Get your school set up</CardTitle>
              <p className="text-sm text-muted-foreground">
                Your school is ready once one instructor has joined and set Donna up. You don't need to set Donna up yourself.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Step
                n={1}
                done={onboarding.invited}
                active={!onboarding.invited}
                title="Invite an instructor"
                hint="We email them a link to join your school."
                action={
                  !onboarding.invited && (
                    <Button size="sm" onClick={() => navigate("/team")}>
                      <UserPlus className="mr-1.5 h-4 w-4" /> Invite
                    </Button>
                  )
                }
              />
              <Step
                n={2}
                done={onboarding.joined}
                active={onboarding.invited && !onboarding.joined}
                title="They accept the invite"
                hint="They open the link and sign in with Google. You can resend it from the Team page."
              />
              <Step
                n={3}
                done={onboarding.ready}
                active={onboarding.joined && !onboarding.ready}
                title="They set Donna up"
                hint="From their own dashboard: Donna settings, a WhatsApp number and Google Calendar."
              />
            </CardContent>
          </Card>
        )}

        {/* Team at a glance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 pb-2">
            <div className="min-w-0">
              <CardTitle className="text-lg">Your instructors</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data.seats.used} of {data.seats.limit} seats used
                {data.seats.invites ? ` · ${data.seats.invites} invite${data.seats.invites === 1 ? "" : "s"} waiting` : ""}
              </p>
            </div>
            <Button variant="outline" size="sm" className="shrink-0" onClick={() => navigate("/team")}>
              Manage <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center text-sm text-muted-foreground">
                <Users className="h-8 w-8 text-slate-300" />
                No instructors have joined yet.
              </div>
            ) : (
              <ul className="divide-y">
                {members.map((m) => (
                  <li key={m.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {m.learners} learner{m.learners === 1 ? "" : "s"} · {m.lessonsThisWeek} lesson{m.lessonsThisWeek === 1 ? "" : "s"} this week
                      </p>
                    </div>
                    <MemberStatus member={m} schoolOn={on} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOff} onOpenChange={setConfirmOff}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch Donna off for everyone?</AlertDialogTitle>
            <AlertDialogDescription>
              Donna will stop replying for all {members.length || "your"} instructor{members.length === 1 ? "" : "s"}. Learners who message
              will be told to contact their instructor directly. You can turn her back on any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep her on</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => changeDonna(false)}>
              Switch off
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function Step({
  n,
  done,
  active,
  title,
  hint,
  action,
}: {
  n: number;
  done: boolean;
  active: boolean;
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {done ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
      ) : (
        <Circle className={`mt-0.5 h-5 w-5 shrink-0 ${active ? "text-sky-600" : "text-slate-300"}`} />
      )}
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${done ? "text-muted-foreground line-through" : ""}`}>
          {n}. {title}
        </p>
        {!done && <p className="text-sm text-muted-foreground">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function MemberStatus({ member, schoolOn }: { member: SchoolMember; schoolOn: boolean }) {
  if (!isReady(member)) return <Badge variant="secondary">Setting up</Badge>;
  if (member.calendarExpired) return <Badge variant="outline" className="border-amber-300 text-amber-700">Paused · calendar expired</Badge>;
  if (!schoolOn || !member.donnaEnabled) {
    return <Badge variant="outline" className="border-red-300 text-red-700">Donna off</Badge>;
  }
  return <Badge variant="outline" className="border-green-300 text-green-700">Donna on</Badge>;
}
