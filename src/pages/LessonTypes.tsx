import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { getLessonTypes, createLessonType, updateLessonType, deleteLessonType, notifySetupChanged } from "@/lib/api";
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
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";

type LessonTypeItem = Awaited<ReturnType<typeof getLessonTypes>>[number];

export default function LessonTypes() {
  const navigate = useNavigate();
  const token = localStorage.getItem("dd_token");
  const [types, setTypes] = useState<LessonTypeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LessonTypeItem | null>(null);
  const [form, setForm] = useState({ name: "", price: "", description: "" });
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: "", price: "", description: "" });
    setDialogOpen(true);
  }

  function openEdit(t: LessonTypeItem) {
    setEditing(t);
    setForm({ name: t.name, price: String(t.price), description: t.description });
    setDialogOpen(true);
  }

  async function handleSave() {
    const price = parseFloat(form.price);
    if (!form.name.trim() || isNaN(price) || price < 0) return;
    setSaving(true);
    try {
      if (editing) {
        await updateLessonType(token!, editing._id, {
          name: form.name.trim(),
          price,
          description: form.description.trim(),
        });
      } else {
        await createLessonType(token!, {
          name: form.name.trim(),
          price,
          description: form.description.trim(),
        });
      }
      await load();
      notifySetupChanged();
      setDialogOpen(false);
    } catch (e) {
      console.error(e);
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
      console.error(e);
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
      console.error(e);
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
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="What this lesson covers..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}>
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
