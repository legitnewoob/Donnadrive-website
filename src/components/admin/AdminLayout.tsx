import { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Tag,
  BadgePercent,
  ShieldCheck,
  Phone,
  ScrollText,
  ArrowLeft,
  Menu,
  Loader2,
  Lock,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";
import { adminApi, type StaffMe } from "@/lib/adminApi";
import { isSuperAdmin, setAccess, signOut } from "@/lib/access";

const StaffContext = createContext<StaffMe | null>(null);

/** The signed-in staff member; `can("admin.pricing")` etc. */
export function useStaff() {
  const me = useContext(StaffContext);
  return { me, can: (permission: string) => !!me?.permissions.includes(permission) };
}

const NAV = [
  { label: "Overview", icon: LayoutDashboard, path: "/admin", permission: "admin.view" },
  { label: "Customers", icon: Users, path: "/admin/customers", permission: "admin.view" },
  { label: "Pricing", icon: Tag, path: "/admin/pricing", permission: "admin.pricing" },
  { label: "Sales & codes", icon: BadgePercent, path: "/admin/sales", permission: "admin.sales" },
  { label: "Phone numbers", icon: Phone, path: "/admin/numbers", permission: "admin.numbers" },
  { label: "Staff & roles", icon: ShieldCheck, path: "/admin/staff", permission: "admin.roles" },
  { label: "Audit log", icon: ScrollText, path: "/admin/audit", permission: "admin.view" },
];

const ROLE_LABEL = { admin: "Admin", support: "Support" };

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** The permission this page needs; without it the page shows "no access" */
  permission?: string;
  children: React.ReactNode;
}

export default function AdminLayout({ title, subtitle, actions, permission = "admin.view", children }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [me, setMe] = useState<StaffMe | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("dd_token")) {
      navigate("/");
      return;
    }
    adminApi
      .me()
      .then((m) => {
        setAccess({ staffRole: m.role, superAdmin: !!m.superAdmin });
        setMe(m);
        setState("ok");
      })
      .catch(() => setState("denied"));
  }, [navigate]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (state === "denied" || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="max-w-sm text-center text-slate-300">
          <Lock className="mx-auto h-10 w-10 text-slate-500" />
          <h1 className="mt-4 text-xl font-bold text-white">Staff only</h1>
          <p className="mt-2 text-sm text-slate-400">This area is for the Donna Drive team. Sign in with a staff Google account.</p>
          <Button className="mt-6" variant="secondary" onClick={() => navigate("/get-onboard")}>Back to your dashboard</Button>
        </div>
      </div>
    );
  }

  const allowed = me.permissions.includes(permission);
  // Super admins don't have an instructor side; other staff may also teach
  const superAdmin = isSuperAdmin();
  const handleSignOut = () => {
    signOut();
    navigate("/");
  };
  const items = NAV.filter((n) => me.permissions.includes(n.permission));

  const Nav = ({ onGo }: { onGo?: () => void }) => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="rounded-lg bg-white p-1">
          <img src={donnaDriveLogo} alt="" className="h-7 w-auto" />
        </span>
        <div>
          <p className="font-bold leading-tight text-white">Donna Drive</p>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Admin</p>
        </div>
      </div>
      <nav aria-label="Admin" className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const active = item.path === "/admin" ? pathname === "/admin" : pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onGo}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-3">
        {!superAdmin && (
          <Link
            to="/get-onboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Instructor dashboard
          </Link>
        )}
        <div className="flex items-center gap-1 rounded-lg bg-white/5 py-1.5 pl-3 pr-1">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-300">{me.email}</p>
            <p className="text-[11px] font-semibold text-violet-400">{superAdmin ? "Super admin" : ROLE_LABEL[me.role]}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <StaffContext.Provider value={me}>
      <div className="flex min-h-screen bg-slate-100">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-slate-950 lg:block">
          <Nav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Phones/tablets: dark top bar with a menu */}
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 bg-slate-950 px-4 pt-[env(safe-area-inset-top)] lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button aria-label="Menu" className="rounded-md p-1.5 text-slate-300 hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 border-0 bg-slate-950 p-0 text-white">
                <Nav onGo={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
            <p className="truncate font-semibold text-white">{title}</p>
            <span className="ml-auto rounded-full bg-violet-600/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-300">
              Admin
            </span>
            <button onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="rounded-md p-1.5 text-slate-300 hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </button>
          </header>

          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 lg:py-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="hidden text-2xl font-bold text-slate-900 lg:block">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {allowed && actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
            {allowed ? (
              children
            ) : (
              <div className="rounded-xl border bg-white p-10 text-center text-sm text-muted-foreground">
                <Lock className="mx-auto mb-3 h-6 w-6 text-slate-400" />
                Your role ({ROLE_LABEL[me.role]}) doesn't include this page. Ask an admin if you need it.
              </div>
            )}
          </main>
        </div>
      </div>
    </StaffContext.Provider>
  );
}

/** A stat card used across admin pages */
export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: React.ElementType;
  tone?: "slate" | "violet" | "green" | "amber" | "red" | "sky";
}) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    violet: "bg-violet-100 text-violet-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    sky: "bg-sky-100 text-sky-600",
  };
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <span className={`rounded-lg p-1.5 ${tones[tone]}`}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-sky-100 text-sky-700",
  past_due: "bg-amber-100 text-amber-800",
  canceled: "bg-slate-200 text-slate-600",
  incomplete: "bg-slate-200 text-slate-600",
  free: "bg-slate-100 text-slate-600",
  comped: "bg-violet-100 text-violet-700",
  school: "bg-indigo-100 text-indigo-700",
  suspended: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
