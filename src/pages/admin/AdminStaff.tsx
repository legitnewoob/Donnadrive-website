import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, UserPlus, Crown } from "lucide-react";
import AdminLayout, { useStaff } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminApi, type StaffMember, type StaffRole } from "@/lib/adminApi";

const ROLES: Array<{ role: StaffRole; label: string; can: string }> = [
  { role: "admin", label: "Admin", can: "Everything: pricing, sales, comps, suspensions and staff roles." },
  { role: "support", label: "Support", can: "View customers and the overview, extend trials, manage phone numbers. No pricing, sales, comps or roles." },
];

export default function AdminStaff() {
  const { me } = useStaff();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("support");
  const [saving, setSaving] = useState("");

  const load = () => adminApi.staff().then(setStaff).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []);

  async function save(targetEmail: string, newRole: StaffRole | null) {
    setSaving(targetEmail);
    try {
      await adminApi.setStaff(targetEmail, newRole);
      toast.success(newRole ? `${targetEmail} is now ${newRole === "admin" ? "an admin" : "support"}` : `${targetEmail} is no longer staff`);
      setEmail("");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't change the role");
    } finally {
      setSaving("");
    }
  }

  return (
    <AdminLayout title="Staff & roles" subtitle="Who can use this admin panel" permission="admin.roles">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-1 flex items-center gap-2 font-semibold"><UserPlus className="h-4 w-4 text-violet-600" /> Add staff</h2>
            <p className="mb-3 text-xs text-muted-foreground">They need to have signed in to Donna Drive with Google once.</p>
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) save(email.trim(), role); }}
            >
              <Input type="email" placeholder="name@donnadrive.co.uk" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1" />
              <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)} className="h-10 rounded-md border bg-white px-2 text-sm" aria-label="Role">
                {ROLES.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}
              </select>
              <Button type="submit" disabled={!email.trim() || !!saving}>
                {saving === email.trim() && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Add
              </Button>
            </form>
          </section>

          <section className="rounded-xl border bg-white">
            <h2 className="border-b px-4 py-3 font-semibold">Team</h2>
            {!staff ? (
              <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
            ) : (
              <ul className="divide-y">
                {staff.map((s) => {
                  const locked = s.superAdmin || s.email === me?.email;
                  return (
                    <li key={s.email} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 font-medium">
                          {s.name || s.email}
                          {s.superAdmin && <Crown className="h-3.5 w-3.5 text-amber-500" aria-label="Super admin" />}
                          {s.email === me?.email && <span className="text-xs font-normal text-muted-foreground">(you)</span>}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.email}
                          {!s.signedUp && " · hasn't signed in yet"}
                        </p>
                      </div>
                      {locked ? (
                        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-violet-600" />
                          {s.superAdmin ? "Super admin (set on the server)" : s.staffRole === "admin" ? "Admin" : "Support"}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={s.staffRole || ""}
                            disabled={saving === s.email}
                            onChange={(e) => save(s.email, (e.target.value || null) as StaffRole | null)}
                            className="h-9 rounded-md border bg-white px-2 text-sm"
                            aria-label={`Role for ${s.email}`}
                          >
                            <option value="admin">Admin</option>
                            <option value="support">Support</option>
                            <option value="">Remove access</option>
                          </select>
                          {saving === s.email && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 font-semibold">What each role can do</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="flex items-center gap-1.5 font-medium"><Crown className="h-3.5 w-3.5 text-amber-500" /> Super admin</dt>
                <dd className="text-muted-foreground">An admin who can't be removed here. Set with SUPER_ADMIN_EMAILS on the server.</dd>
              </div>
              {ROLES.map((r) => (
                <div key={r.role}>
                  <dt className="font-medium">{r.label}</dt>
                  <dd className="text-muted-foreground">{r.can}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-xl border bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold">Driving school roles</h2>
            <p className="text-muted-foreground">
              School owners set these on their Team page: <strong>Owner</strong> (everything, incl. billing),{" "}
              <strong>Manager</strong> (invite and remove instructors, see everyone's learners) and <strong>Instructor</strong> (their own data).
            </p>
          </section>
        </aside>
      </div>
    </AdminLayout>
  );
}
