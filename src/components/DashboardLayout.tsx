import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  UserCircle,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://portal.donnadrive.co.uk";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  initials?: string;
}

const DashboardLayout = ({ children, title, subtitle, initials = "AD" }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("dd_token");
    localStorage.removeItem("dd_apiKey");
    window.dispatchEvent(new Event("dd_auth_change"));
    navigate("/");
  };

  function getPortalUrl() {
    const params = new URLSearchParams();
    const token = localStorage.getItem("dd_token");
    const apiKey = localStorage.getItem("dd_apiKey");
    if (token) params.set("token", token);
    if (apiKey) params.set("apiKey", apiKey);
    return `${PORTAL_URL}?${params.toString()}`;
  }

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/get-onboard" },
    { label: "Learners", icon: Users, path: "/learners" },
    { label: "Lesson Types", icon: BookOpen, path: "/lesson-types" },
    { label: "Account", icon: UserCircle, path: "/account" },
  ];

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <div className="p-6 flex items-center gap-3">
        <img src={donnaDriveLogo} alt="Donna Drive" className="h-10 w-auto rounded-lg" />
        <div>
          <h1 className="font-bold text-slate-900">Donna Drive</h1>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (mobile) setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}

        <a
          href={getPortalUrl()}
          data-tour="portal-link"
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Smartphone className="h-5 w-5" />
          Open Portal
        </a>
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile Header + Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-2">
              <img src={donnaDriveLogo} alt="Donna Drive" className="h-[34px] w-auto rounded-lg" />
              <span className="font-bold text-slate-900 text-[17px] tracking-tight">Donna Drive</span>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={getPortalUrl()}
                data-tour="portal-link-mobile"
                title="Open Portal"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Smartphone className="h-5 w-5" />
              </a>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-0 flex flex-col">
                  <div className="flex justify-end p-4">
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon">
                        <X className="h-5 w-5" />
                      </Button>
                    </SheetClose>
                  </div>
                  <NavContent mobile />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white border-b sticky top-0 z-10 items-center justify-between px-6 h-14">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1">
            <a
              href={getPortalUrl()}
              title="Open Portal"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-sm font-medium">Portal</span>
            </a>
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

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
