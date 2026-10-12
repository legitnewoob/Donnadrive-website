import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  AlertCircle,
  User,
  Phone,
  CreditCard,
  FileText,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  getInvoices,
  createPortalSession,
  requestPhoneNumber,
} from "@/lib/api";

const PLAN_LABELS: Record<string, string> = {
  pdi: "PDI (Free)",
  adi: "ADI Pro",
  "driving-school": "Driving School",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-amber-100 text-amber-700",
  canceled: "bg-red-100 text-red-700",
  incomplete: "bg-slate-100 text-slate-500",
};

interface Profile {
  name: string;
  email: string;
  plan: string;
  subscriptionStatus: string | null;
  phoneNumber: string | null;
  phoneNumberId: string | null;
  onboardingComplete: boolean;
  onboardingStatus: {
    phoneAssigned: boolean;
    subscriptionActive: boolean;
    calendarConnected: boolean;
  };
  timezone?: string;
  createdAt?: string;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  description: string;
  pdfUrl: string | null;
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Profile edit
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTimezone, setEditTimezone] = useState("Europe/London");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Invoices
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  // Phone
  const [requestingNumber, setRequestingNumber] = useState(false);
  const [numberError, setNumberError] = useState("");

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Stripe portal
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("dd_token");
    if (!t) {
      setError("Please sign in to view your profile.");
      setLoading(false);
      return;
    }
    setToken(t);

    Promise.all([
      getProfile(t),
      getInvoices(t).catch(() => ({ invoices: [] })),
    ]).then(([p, inv]) => {
      setProfile(p);
      setEditName(p.name);
      setEditTimezone((p as any).timezone || "Europe/London");
      setInvoices(inv.invoices);
      setInvoicesLoading(false);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    }).finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    if (!token) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateProfile(token, { name: editName, timezone: editTimezone });
      setProfile((p) => p ? { ...p, name: editName, timezone: editTimezone } : p);
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleRequestNumber() {
    if (!token) return;
    setRequestingNumber(true);
    setNumberError("");
    try {
      const result = await requestPhoneNumber(token);
      setProfile((p) =>
        p ? { ...p, phoneNumber: result.phoneNumber, phoneNumberId: result.phoneNumberId, onboardingStatus: { ...p.onboardingStatus, phoneAssigned: true } } : p
      );
    } catch (err) {
      setNumberError(err instanceof Error ? err.message : "Failed to request number");
    } finally {
      setRequestingNumber(false);
    }
  }

  async function handleManageSubscription() {
    if (!token) return;
    setPortalLoading(true);
    try {
      const data = await createPortalSession(token);
      window.location.href = data.url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!token || deleteConfirm !== "DELETE") return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(token);
      localStorage.removeItem("dd_token");
      localStorage.removeItem("dd_apiKey");
      window.dispatchEvent(new Event("dd_auth_change"));
      navigate("/");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DashboardLayout title="Account" subtitle="Manage your profile and subscription" initials={initials}>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-sky-600" />
                Profile
              </CardTitle>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <select
                    value={editTimezone}
                    onChange={(e) => setEditTimezone(e.target.value)}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Europe/London">Europe/London</option>
                    <option value="Europe/Dublin">Europe/Dublin</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/Berlin">Europe/Berlin</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                  </select>
                </div>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Saving...</> : "Save"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{profile.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{profile.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Timezone</span>
                  <span className="font-medium">{(profile as any).timezone || "Europe/London"}</span>
                </div>
                {(profile as any).createdAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">{new Date((profile as any).createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Number */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-sky-600" />
              WhatsApp Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.phoneNumber ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Number</span>
                  <span className="font-semibold">{profile.phoneNumber}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Request a WhatsApp number so your learners can message Donna AI for bookings, reminders, and queries.
                </p>
                {numberError && <p className="text-sm text-red-600">{numberError}</p>}
                <Button onClick={handleRequestNumber} disabled={requestingNumber} className="rounded-xl">
                  {requestingNumber ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Requesting...</> : "Request Number"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-sky-600" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm items-center">
                <span className="text-muted-foreground">Plan</span>
                <Badge variant="secondary">{PLAN_LABELS[profile.plan] || profile.plan}</Badge>
              </div>
              {profile.subscriptionStatus && (
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={STATUS_COLORS[profile.subscriptionStatus] || "bg-slate-100 text-slate-500"}>
                    {profile.subscriptionStatus.replace("_", " ")}
                  </Badge>
                </div>
              )}
              {profile.plan !== "pdi" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  {portalLoading ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Opening...</> : (
                    <>Manage Subscription <ExternalLink className="h-3 w-3 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Billing */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-600" />
                Billing
              </CardTitle>
              {profile.subscriptionStatus && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                >
                  Payment Methods
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <p className="text-sm text-muted-foreground">Loading invoices...</p>
            ) : invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <div className="space-y-2">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{new Date(inv.date).toLocaleDateString()}</p>
                      <p className="text-xs text-muted-foreground">{inv.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">£{inv.amount.toFixed(2)}</span>
                      <Badge className={inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"} variant="secondary">
                        {inv.status}
                      </Badge>
                      {inv.pdfUrl && (
                        <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-sky-600 hover:underline">
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="mt-6 border-red-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-red-600">
            <Trash2 className="h-4 w-4" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) { setDeleteConfirm(""); setDeleteError(""); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Type <strong>DELETE</strong> to confirm. Your subscription will be canceled and your WhatsApp number released.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
              >
                {deleting ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Deleting...</> : "Delete Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
