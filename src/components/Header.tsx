import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LayoutDashboard, Smartphone, ShieldCheck, LogOut, Sparkles, LogIn } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";
import PrimaryCTA from "@/components/launch/PrimaryCTA";
import LaunchBanner from "@/components/launch/LaunchBanner";
import { useLaunchActions } from "@/components/launch/LaunchProvider";
import { isClosed, useLaunch } from "@/lib/launch";
import { getAccess, signOut } from "@/lib/access";
import { getProfile, openPortal } from "@/lib/api";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://portal.donnadrive.co.uk";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openSignIn } = useLaunchActions();
  // While the waitlist is on, "Join the waitlist" leads and signing in is a quiet link
  const closed = isClosed(useLaunch());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Staff get an Admin panel button; super admins aren't customers, so only that
  const [staff, setStaff] = useState(false);
  const [superAdmin, setSuperAdmin] = useState(false);
  // Signed in but no plan yet: dashboard and Portal stay locked, so just "Finish signing up"
  const [planless, setPlanless] = useState(false);

  const checkAuth = useCallback(() => {
    const signedIn = !!localStorage.getItem("dd_token");
    const access = signedIn ? getAccess() : null;
    setIsLoggedIn(signedIn);
    setStaff(!!access?.staffRole);
    setSuperAdmin(!!access?.superAdmin);
    setPlanless(!!access?.needsPlan && !access?.staffRole);
  }, []);

  // Signed in before roles were remembered: look them up once
  useEffect(() => {
    const token = localStorage.getItem("dd_token");
    if (token && !getAccess()) getProfile(token).then(checkAuth).catch(() => {});
  }, [checkAuth]);

  function handleSignOut() {
    signOut();
    navigate("/");
  }

  useEffect(() => {
    checkAuth();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "dd_token") checkAuth();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("dd_auth_change", checkAuth);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dd_auth_change", checkAuth);
    };
  }, [checkAuth]);


  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <LaunchBanner />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/90 md:bg-white/10 md:backdrop-blur-xl shadow-lg px-4 sm:px-6 py-3 will-change-transform">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src={donnaDriveLogo}
                alt="Donna Drive"
                className="h-11 w-auto rounded-xl"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {!isHome && (
                <Link
                  to="/"
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  Home
                </Link>
              )}
              {isHome ? (
                <a href="#how-it-works" className="text-black/90 hover:text-black transition-colors font-medium">How It Works</a>
              ) : (
                <Link to="/#how-it-works" className="text-black/90 hover:text-black transition-colors font-medium">How It Works</Link>
              )}
              {isHome ? (
                <a href="#pricing" className="text-black/90 hover:text-black transition-colors font-medium">Pricing</a>
              ) : (
                <Link to="/#pricing" className="text-black/90 hover:text-black transition-colors font-medium">Pricing</Link>
              )}
              {isHome ? (
                <a href="#faq" className="text-black/90 hover:text-black transition-colors font-medium">FAQ</a>
              ) : (
                <Link to="/#faq" className="text-black/90 hover:text-black transition-colors font-medium">FAQ</Link>
              )}
              <Link
                to="/blog"
                className={`transition-colors font-medium ${pathname.startsWith("/blog")
                    ? "text-black"
                    : "text-black/90 hover:text-black"
                  }`}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                className={`transition-colors font-medium ${pathname === "/contact" ? "text-black" : "text-black/90 hover:text-black"}`}
              >
                Contact us
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isLoggedIn && planless ? (
                <div className="hidden sm:flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" />
                    Finish signing up
                  </button>
                  <div className="w-px h-6 bg-primary/15" />
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    aria-label="Sign out"
                    className="flex items-center px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : isLoggedIn && superAdmin ? (
                <div className="hidden sm:flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Go to admin panel
                  </button>
                  <div className="w-px h-6 bg-slate-200" />
                  <button
                    onClick={handleSignOut}
                    title="Sign out"
                    aria-label="Sign out"
                    className="flex items-center px-3 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : isLoggedIn ? (
                <div className="hidden sm:flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                  {staff && (
                    <>
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Admin
                      </button>
                      <div className="w-px h-6 bg-primary/15" />
                    </>
                  )}
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>
                  <div className="w-px h-6 bg-primary/15" />
                  <a
                    href={PORTAL_URL}
                    onClick={openPortal}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Smartphone className="h-4 w-4" />
                    Portal
                  </a>
                </div>
              ) : (
                <>
                  {closed ? (
                    // Same split pill as signed-in "Dashboard | Portal": the waitlist leads, signing in sits beside it
                    <div className="hidden sm:flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                      <PrimaryCTA
                        closedLabel={
                          <>
                            <Sparkles className="h-4 w-4" />
                            Join the waitlist
                          </>
                        }
                        className="h-auto gap-2 rounded-none bg-transparent px-4 py-2.5 text-sm font-semibold text-primary shadow-none hover:bg-primary/5"
                      />
                      <div className="w-px h-6 bg-primary/15" />
                      <button
                        onClick={openSignIn}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </button>
                    </div>
                  ) : (
                    <PrimaryCTA
                      size="lg"
                      openLabel="Get Started"
                      className="hidden sm:inline-flex rounded-xl bg-white text-primary hover:bg-white/90 px-7 shadow-lg"
                    />
                  )}
                  {/* Phones: a compact version beside the menu */}
                  {closed && (
                    <PrimaryCTA
                      size="sm"
                      closedLabel="Join waitlist"
                      className="sm:hidden rounded-xl h-9 px-3.5 shadow"
                    />
                  )}
                </>
              )}

              {/* Mobile Menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden text-black p-2"
                    aria-label="Open Menu"
                  >
                    <Menu className="w-7 h-7" />
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  className="bg-background w-80 border-l"
                >
                  <nav className="flex flex-col gap-6 mt-12">
                    {!isHome && (
                      <SheetClose asChild>
                        <Link
                          to="/"
                          className="text-lg font-medium hover:text-primary"
                        >
                          Home
                        </Link>
                      </SheetClose>
                    )}
                    <SheetClose asChild>
                      {isHome ? (
                        <a href="#how-it-works" className="text-lg font-medium hover:text-primary">How It Works</a>
                      ) : (
                        <Link to="/#how-it-works" className="text-lg font-medium hover:text-primary">How It Works</Link>
                      )}
                    </SheetClose>
                    <SheetClose asChild>
                      {isHome ? (
                        <a href="#pricing" className="text-lg font-medium hover:text-primary">Pricing</a>
                      ) : (
                        <Link to="/#pricing" className="text-lg font-medium hover:text-primary">Pricing</Link>
                      )}
                    </SheetClose>
                    <SheetClose asChild>
                      {isHome ? (
                        <a href="#faq" className="text-lg font-medium hover:text-primary">FAQ</a>
                      ) : (
                        <Link to="/#faq" className="text-lg font-medium hover:text-primary">FAQ</Link>
                      )}
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/blog"
                        className="text-lg font-medium hover:text-primary"
                      >
                        Blog
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/contact" className="text-lg font-medium hover:text-primary">
                        Contact us
                      </Link>
                    </SheetClose>

                    {isLoggedIn && staff && (
                      <SheetClose asChild>
                        <Link to="/admin" className="text-lg font-medium text-violet-700 hover:text-violet-900 flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5" />
                          {superAdmin ? "Go to admin panel" : "Admin panel"}
                        </Link>
                      </SheetClose>
                    )}
                    {isLoggedIn && planless ? (
                      <>
                        <SheetClose asChild>
                          <Link to="/dashboard" className="text-lg font-medium text-primary flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            Finish signing up
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <button onClick={handleSignOut} className="text-lg font-medium hover:text-primary flex items-center gap-2 text-left">
                            <LogOut className="h-5 w-5" />
                            Sign out
                          </button>
                        </SheetClose>
                      </>
                    ) : isLoggedIn && superAdmin ? (
                      <SheetClose asChild>
                        <button onClick={handleSignOut} className="text-lg font-medium hover:text-primary flex items-center gap-2 text-left">
                          <LogOut className="h-5 w-5" />
                          Sign out
                        </button>
                      </SheetClose>
                    ) : isLoggedIn ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            to="/dashboard"
                            className="text-lg font-medium hover:text-primary flex items-center gap-2"
                          >
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <a
                            href={PORTAL_URL}
                    onClick={openPortal}
                            className="text-lg font-medium hover:text-primary flex items-center gap-2"
                          >
                            <Smartphone className="h-5 w-5" />
                            Portal
                          </a>
                        </SheetClose>
                      </>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {/* Close the menu as the dialog opens */}
                        <div onClickCapture={() => setMobileOpen(false)}>
                          <PrimaryCTA openLabel="Get Started" className="w-full h-12 rounded-xl text-base" />
                        </div>
                        {closed && (
                          <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <SheetClose asChild>
                              <button onClick={openSignIn} className="font-medium text-slate-900 underline underline-offset-2">
                                Sign in
                              </button>
                            </SheetClose>
                          </p>
                        )}
                      </div>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
