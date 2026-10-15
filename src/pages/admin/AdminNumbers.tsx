import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Phone, Unlink, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { adminApi, type PoolNumber } from "@/lib/adminApi";

const STATUS = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-800",
  assigned: "bg-sky-100 text-sky-700",
};

export default function AdminNumbers() {
  const [numbers, setNumbers] = useState<PoolNumber[] | null>(null);
  const [filter, setFilter] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ phoneNumber: "", phoneNumberId: "", region: "GB", label: "", whatsappToken: "" });
  const [confirm, setConfirm] = useState<{ n: PoolNumber; action: "revoke" | "delete" } | null>(null);

  const load = () => adminApi.numbers(filter || undefined).then((r) => setNumbers(r.data)).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      await adminApi.addNumber({ ...form, whatsappToken: form.whatsappToken || undefined, label: form.label || undefined });
      toast.success(`${form.phoneNumber} added to the pool`);
      setForm({ phoneNumber: "", phoneNumberId: "", region: "GB", label: "", whatsappToken: "" });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add the number");
    } finally {
      setAdding(false);
    }
  }

  async function run() {
    if (!confirm) return;
    try {
      if (confirm.action === "revoke") await adminApi.revokeNumber(confirm.n._id);
      else await adminApi.deleteNumber(confirm.n._id);
      toast.success(confirm.action === "revoke" ? "Number released back to the pool" : "Number deleted");
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That didn't work");
    }
  }

  const counts = (numbers || []).reduce<Record<string, number>>((acc, n) => ({ ...acc, [n.status]: (acc[n.status] || 0) + 1 }), {});

  return (
    <AdminLayout title="Phone numbers" subtitle="The WhatsApp numbers Donna hands out to instructors" permission="admin.numbers">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
            <h2 className="mr-auto font-semibold">Pool</h2>
            {["", "available", "assigned", "reserved"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {s || "All"}{!filter && s && counts[s] ? ` · ${counts[s]}` : ""}
              </button>
            ))}
          </div>
          {!numbers ? (
            <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
          ) : numbers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No numbers here.</p>
          ) : (
            <ul className="divide-y">
              {numbers.map((n) => (
                <li key={n._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4 text-slate-400" /> {n.phoneNumber}
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS[n.status]}`}>{n.status}</span>
                      <span className="text-xs text-muted-foreground">{n.region}</span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      ID {n.phoneNumberId}{n.label && ` · ${n.label}`}
                      {n.assignedTo && ` · ${n.assignedTo.name} (${n.assignedTo.email})`}
                    </p>
                  </div>
                  {n.status === "assigned" ? (
                    <Button size="sm" variant="outline" onClick={() => setConfirm({ n, action: "revoke" })}><Unlink className="mr-1.5 h-3.5 w-3.5" /> Release</Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setConfirm({ n, action: "delete" })}><Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete</Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="h-fit rounded-xl border bg-white p-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold"><Plus className="h-4 w-4 text-violet-600" /> Add a number</h2>
          <form onSubmit={add} className="space-y-3">
            <div>
              <Label className="text-xs">Phone number</Label>
              <Input required placeholder="447700900123" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">WhatsApp phone number ID</Label>
              <Input required placeholder="From Meta's WhatsApp manager" value={form.phoneNumberId} onChange={(e) => setForm({ ...form, phoneNumberId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Region</Label>
                <Input value={form.region} maxLength={2} onChange={(e) => setForm({ ...form, region: e.target.value.toUpperCase() })} />
              </div>
              <div>
                <Label className="text-xs">Label</Label>
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Access token (optional)</Label>
              <Input type="password" placeholder="Uses WHATSAPP_TOKEN if blank" value={form.whatsappToken} onChange={(e) => setForm({ ...form, whatsappToken: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={adding}>
              {adding && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />} Add to pool
            </Button>
          </form>
        </section>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm?.action === "revoke" ? `Release ${confirm?.n.phoneNumber}?` : `Delete ${confirm?.n.phoneNumber}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.action === "revoke"
                ? `${confirm?.n.assignedTo?.name || "The instructor"} loses this number and Donna stops answering on it. Their learners and history are kept.`
                : "It's removed from the pool. You can add it again later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={run}>{confirm?.action === "revoke" ? "Release" : "Delete"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
