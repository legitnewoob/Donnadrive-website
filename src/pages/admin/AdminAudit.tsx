import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminApi, type AuditEntry, type Pagination } from "@/lib/adminApi";

const FILTERS = [
  ["", "Everything"],
  ["customer", "Customers"],
  ["plan", "Pricing"],
  ["price-change", "Price changes"],
  ["sale", "Sales"],
  ["promo", "Codes"],
  ["staff", "Staff"],
  ["school", "Schools"],
  ["numbers", "Numbers"],
];

export default function AdminAudit() {
  const [rows, setRows] = useState<AuditEntry[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");

  useEffect(() => {
    setRows(null);
    adminApi
      .audit({ page, action })
      .then((r) => { setRows(r.data); setPagination(r.pagination || null); })
      .catch((e) => toast.error(e.message));
  }, [page, action]);

  return (
    <AdminLayout title="Audit log" subtitle="Who changed what">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map(([v, l]) => (
          <button
            key={v}
            onClick={() => { setAction(v); setPage(1); }}
            className={`rounded-full px-3 py-1 text-xs font-medium ${action === v ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border bg-white">
        {!rows ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r._id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <code className="rounded bg-violet-50 px-1.5 py-0.5 text-xs font-semibold text-violet-700">{r.action}</code>
                  {r.target && <span className="font-medium">{r.target}</span>}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">by {r.actor}</p>
                {r.details && Object.keys(r.details).length > 0 && (
                  <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all rounded bg-slate-50 p-2 text-[11px] text-slate-600">
                    {JSON.stringify(r.details, null, 1)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
          <Button size="icon" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </AdminLayout>
  );
}
