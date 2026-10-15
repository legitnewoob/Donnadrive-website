import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  UserCircle,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Smartphone,
  Compass,
  SlidersHorizontal,
  MoreHorizontal,
  ArrowUpRight,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";
import { START_TOUR_EVENT } from "@/components/DashboardTour";
import { getSetupStatus, getProfile, SETUP_CHANGED_EVENT } from "@/lib/api";
import { isSchoolOwner } from "@/lib/access";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://portal.donnadrive.co.uk";

// The signed-in email, read from the stored JWT (display only, never trusted)
function signedInEmail() {
  try {
    const payload = localStorage.getItem("dd_token")?.split(".")[1];
    if (!payload) return "";
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.email === "string" ? json.email : "";
  } catch {
    return "";
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  initials?: string;
  /** Shown above the bottom tab bar on phones, e.g. an unsaved-changes bar */
  mobileFooter?: React.ReactNode;
}

// Small red dot meaning "something here needs your attention"
const SetupDot = ({ floating = false }: { floating?: boolean }) => (
  <span
    className={`h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white ${floating ? "absolute -right-1 -top-0.5" : ""}`}
    aria-label="Needs setting up"
    role="status"
  />
);

const DashboardLayout = ({ children, title, subtitle, initials = "AD", mobileFooter }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Red dot on Donna Settings until the required setup is done
  const [setupIncomplete, setSetupIncomplete] = useState(false);
  // Driving school owners and managers get a Team page; Donna Drive staff get Admin
  const [seesTeam, setSeesTeam] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  // School owners don't run Donna themselves: just their school, team and account
  const [owner, setOwner] = useState(isSchoolOwner);

  useEffect(() => {
    const token = localStorage.getItem("dd_token");
    if (!token) return;
    getProfile(token)
      .then((p) => {
        setSeesTeam(p.school?.role === "owner" || p.school?.role === "manager");
        setOwner(p.school?.role === "owner");
        setIsStaff(!!p.access?.staffRole);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("dd_token");
    if (!token || owner) return;
    const refresh = () =>
      getSetupStatus(token)
        .then((s) => setSetupIncomplete(!s.complete && !s.hasNumber))
        .catch(() => {});
    refresh();
    window.addEventListener(SETUP_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(SETUP_CHANGED_EVENT, refresh);
  }, [owner]);

  const handleLogout = () => {
    localStorage.removeItem("dd_token");
    localStorage.removeItem("dd_access");
    localStorage.removeItem("dd_apiKey");
    window.dispatchEvent(new Event("dd_auth_change"));
    navigate("/");
  };

  function startTour() {
    setMobileOpen(false);
    if (pathname === "/dashboard") {
      window.dispatchEvent(new Event(START_TOUR_EVENT));
    } else {
      navigate("/dashboard?tour=1");
    }
  }

  function getPortalUrl() {
    const params = new URLSearchParams();
    const token = localStorage.getItem("dd_token");
    const apiKey = localStorage.getItem("dd_apiKey");
    if (token) params.set("token", token);
    if (apiKey) params.set("apiKey", apiKey);
    return `${PORTAL_URL}?${params.toString()}`;
  }

  type NavItem = { label: string; short: string; icon: React.ElementType; path: string; tour?: string; inBottomBar?: boolean };
  const ownerItems: NavItem[] = [
    { label: "School", short: "Home", icon: LayoutDashboard, path: "/school", inBottomBar: true },
    { label: "Team", short: "Team", icon: Building2, path: "/team", inBottomBar: true },
    { label: "Account", short: "Account", icon: UserCircle, path: "/account", inBottomBar: true },
  ];
  const instructorItems: NavItem[] = [
    { label: "Dashboard", short: "Home", icon: LayoutDashboard, path: "/dashboard", inBottomBar: true },
    { label: "Learners", short: "Learners", icon: Users, path: "/learners", inBottomBar: true },
    { label: "Lesson Types", short: "Lessons", icon: BookOpen, path: "/lesson-types" },
    ...(seesTeam ? [{ label: "Team", short: "Team", icon: Building2, path: "/team" }] : []),
    { label: "Donna Settings", short: "Settings", icon: SlidersHorizontal, path: "/settings", tour: "settings-link", inBottomBar: true },
    { label: "Account", short: "Account", icon: UserCircle, path: "/account", inBottomBar: true },
  ];
  const navItems = owner ? ownerItems : instructorItems;

  const email = signedInEmail();
  const byPath = (path: string) => navItems.find((item) => item.path === path)!;
  // Everyday pages on top; settings and help pinned at the bottom; account last
  const mainItems = (owner ? ["/school", "/team"] : ["/dashboard", "/learners", ...(seesTeam ? ["/team"] : []), "/lesson-types"]).map(byPath);
  const settingsItem = owner ? null : byPath("/settings");

  const itemClass = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => {
    const go = (path: string) => {
      navigate(path);
      if (mobile) setMobileOpen(false);
    };
    const NavButton = ({ item }: { item: (typeof navItems)[number] }) => {
      const Icon = item.icon;
      const active = pathname === item.path;
      return (
        <button
          data-tour={mobile ? undefined : item.tour}
          onClick={() => go(item.path)}
          aria-current={active ? "page" : undefined}
          className={itemClass(active)}
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {item.path === "/settings" && setupIncomplete && <SetupDot />}
        </button>
      );
    };
    const accountActive = pathname === "/account";

    return (
      <>
        <div className={`${mobile ? "px-6 pb-4" : "p-6"} flex items-center`}>
          <img src={donnaDriveLogo} alt="Donna Drive" className="h-10 w-auto rounded-lg" />
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 space-y-1">
          {mainItems.map((item) => (
            <NavButton key={item.path} item={item} />
          ))}
          {!owner && (
            <a
              href={getPortalUrl()}
              data-tour="portal-link"
              className={itemClass(false)}
            >
              <Smartphone className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">Open Portal</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden />
            </a>
          )}
        </nav>

        <div className="px-3 pb-3 space-y-1">
          {isStaff && (
            <button onClick={() => go("/admin")} className={itemClass(false)}>
              <ShieldCheck className="h-5 w-5 shrink-0 text-violet-600" />
              <span className="flex-1 text-left">Admin panel</span>
              <ArrowUpRight className="h-4 w-4 text-slate-400" aria-hidden />
            </button>
          )}
          {settingsItem && <NavButton item={settingsItem} />}
          {!owner && (
            <button onClick={startTour} className={itemClass(false)}>
              <Compass className="h-5 w-5 shrink-0" />
              Take the tour
            </button>
          )}
        </div>

        {/* Account */}
        <div className="flex items-center gap-1 border-t p-3">
          <button
            onClick={() => go("/account")}
            aria-current={accountActive ? "page" : undefined}
            className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
              accountActive ? "bg-slate-900 text-white" : "hover:bg-slate-100"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className={`block text-sm font-medium ${accountActive ? "text-white" : "text-slate-900"}`}>Account</span>
              {email && (
                <span className={`block truncate text-xs ${accountActive ? "text-white/70" : "text-muted-foreground"}`}>{email}</span>
              )}
            </span>
          </button>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out" aria-label="Log out" className="shrink-0 text-slate-500">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/95 backdrop-blur border-b sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between gap-3 px-4 h-14">
            <div className="flex min-w-0 items-center gap-2.5">
              <img src={donnaDriveLogo} alt="Donna Drive" className="h-8 w-auto shrink-0 rounded-lg" />
              <div className="min-w-0">
                <h2 className="truncate text-[15px] font-bold leading-tight text-slate-900">{title}</h2>
                {subtitle && <p className="truncate text-[11px] leading-tight text-muted-foreground">{subtitle}</p>}
              </div>
            </div>
            {!owner && (
              <a
                href={getPortalUrl()}
                data-tour="portal-link"
                className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                Portal
              </a>
            )}
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b sticky top-0 z-10 items-center justify-between px-6 h-14">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1">
            {!owner && (
              <>
                <a
                  href={getPortalUrl()}
                  title="Open Portal"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <Smartphone className="h-5 w-5" />
                  <span className="text-sm font-medium">Portal</span>
                </a>
                <button
                  onClick={startTour}
                  title="Take the tour"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <Compass className="h-5 w-5" />
                  <span className="text-sm font-medium">Tour</span>
                </button>
              </>
            )}
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold ml-1">
              {initials}
            </div>
          </div>
        </header>

        {/* overflow-x-clip (not hidden) so sticky elements inside still stick to the window */}
        <main className={`flex-1 p-4 sm:p-6 lg:pb-6 overflow-x-clip ${mobileFooter ? "pb-44 sm:pb-44" : "pb-28 sm:pb-28"}`}>
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
          {mobileFooter}
          <div className={`grid ${owner ? "grid-cols-4" : "grid-cols-5"}`}>
            {navItems.filter((item) => item.inBottomBar).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.path;
              return (
                <button
                  key={item.path}
                  data-tour={item.tour}
                  onClick={() => navigate(item.path)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  <span className="relative">
                    <Icon className={`h-5 w-5 ${active ? "stroke-[2.25]" : ""}`} />
                    {item.path === "/settings" && setupIncomplete && <SetupDot floating />}
                  </span>
                  {item.short}
                </button>
              );
            })}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    ["/lesson-types", "/team"].includes(pathname) ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  <MoreHorizontal className="h-5 w-5" />
                  More
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0 flex flex-col pb-[env(safe-area-inset-bottom)]">
                {/* The sheet has its own close button; this keeps the logo clear of it */}
                <div className="h-12" />
                <NavContent mobile />
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default DashboardLayout;
