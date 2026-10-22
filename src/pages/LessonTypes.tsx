import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getLessonTypes, createLessonType, updateLessonType, deleteLessonType, notifySetupChanged, formatDuration } from "@/lib/api";
import LessonLengthSelect from "@/components/LessonLengthSelect";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Loader2, BookOpen, Clock } from "lucide-react";

const QUICK_LENGTHS = [60, 90, 120];

type LessonTypeItem = Awaited<ReturnType<typeof getLessonTypes>>[number];

export default function LessonTypes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [types, setTypes] = useState<LessonTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LessonTypeItem | null>(null);
  const [form, setForm] = useState<{ name: string; price: string; description: string; durationMin: number | null }>({
    name: "",
    price: "",
    description: "",
    durationMin: null,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<LessonTypeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/"); return; }
    load();
  }, [token, navigate]);

  async function load() {
    try {
      const data = await getLessonTypes(token!);
      setTypes(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load lesson types");
    } finally {
      setLoading(false);
    }
  }

  // Lengths other active lesson types already use (each needs its own)
  const takenLengths = (except?: string) =>
    types.filter((t) => t.active && t.durationMin && t._id !== except).map((t) => t.durationMin as number);

  function openCreate() {
    setEditing(null);
    const free = QUICK_LENGTHS.find((m) => !takenLengths().includes(m)) ?? null;
    setForm({ name: "", price: "", description: "", durationMin: free });
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(t: LessonTypeItem) {
    setEditing(t);
    setForm({ name: t.name, price: String(t.price), description: t.description, durationMin: t.durationMin });
    setFormError("");
    setDialogOpen(true);
  }

  async function handleSave() {
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price < 0) return;
    if (!form.durationMin) {
      setFormError("Choose how long this lesson is.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateLessonType(token!, editing._id, {
          name: form.name.trim(),
          price,
          durationMin: form.durationMin,
          description: form.description.trim(),
        });
      } else {
        await createLessonType(token!, {
          name: form.name.trim(),
          price,
          durationMin: form.durationMin,
          description: form.description.trim(),
        });
      }
      await load();
      notifySetupChanged();
      setDialogOpen(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(t: LessonTypeItem) {
    try {
      await updateLessonType(token!, t._id, { active: !t.active });
      notifySetupChanged();
      setTypes((prev) => prev.map((x) => (x._id === t._id ? { ...x, active: !x.active } : x)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteLessonType(token!, deleteTarget._id);
      notifySetupChanged();
      setTypes((prev) => prev.filter((x) => x._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DashboardLayout title="Lesson Types">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{types.length} lesson type{types.length !== 1 ? "s" : ""}</p>
            <Button onClick={openCreate} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Lesson Type
            </Button>
          </div>

          {types.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-10 w-10 text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">No lesson types yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Add your first lesson type to start tracking pricing
                </p>
                <Button onClick={openCreate} size="sm" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Lesson Type
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {types.map((t) => (
                <Card key={t._id} className={`relative ${!t.active ? "opacity-60" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{t.name}</h3>
                        <p className="text-2xl font-bold text-slate-900 mt-1">&pound;{t.price}</p>
                        {t.durationMin ? (
                          <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5" /> {formatDuration(t.durationMin)}
                          </p>
                        ) : (
                          <button type="button" onClick={() => openEdit(t)} className="mt-1 text-sm font-medium text-amber-700 underline">
                            Set a length
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => setDeleteTarget(t)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">{t.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={t.active}
                        onCheckedChange={() => handleToggleActive(t)}
                      />
                      <Label className="text-xs text-slate-500">{t.active ? "Active" : "Inactive"}</Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Lesson Type" : "Add Lesson Type"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Beginner, Motorway"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Price (&pound;)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="40"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lesson-length">Length</Label>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_LENGTHS.map((m) => {
                  const used = takenLengths(editing?._id).includes(m);
                  return (
                    <Button
                      key={m}
                      type="button"
                      size="sm"
                      variant={form.durationMin === m ? "default" : "outline"}
                      disabled={used}
                      title={used ? "Another lesson type already has this length" : undefined}
                      onClick={() => setForm((f) => ({ ...f, durationMin: m }))}
                    >
                      {formatDuration(m)}
                    </Button>
                  );
                })}
                <LessonLengthSelect
                  id="lesson-length"
                  value={form.durationMin}
                  taken={takenLengths(editing?._id)}
                  onChange={(m) => setForm((f) => ({ ...f, durationMin: m }))}
                  className="w-28"
                />
              </div>
              <p className="text-xs text-slate-500">Donna fits lessons into your day by length. Each lesson type needs a different length.</p>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What this lesson covers..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price || !form.durationMin}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this lesson type. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
