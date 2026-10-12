import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, LayoutDashboard, Smartphone } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";
import SignupDialog from "@/components/SignupDialog";

const PORTAL_URL = import.meta.env.VITE_PORTAL_URL || "https://portal.donnadrive.co.uk";

const Header = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkAuth = useCallback(() => {
    setIsLoggedIn(!!localStorage.getItem("dd_token"));
  }, []);

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

  function getPortalUrl() {
    const params = new URLSearchParams();
    const token = localStorage.getItem("dd_token");
    const apiKey = localStorage.getItem("dd_apiKey");
    if (token) params.set("token", token);
    if (apiKey) params.set("apiKey", apiKey);
    return `${PORTAL_URL}?${params.toString()}`;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/90 md:bg-white/10 md:backdrop-blur-xl shadow-lg px-6 py-3 will-change-transform">
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
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="hidden sm:flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                  <button
                    onClick={() => navigate("/get-onboard")}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </button>
                  <div className="w-px h-6 bg-primary/15" />
                  <a
                    href={getPortalUrl()}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    <Smartphone className="h-4 w-4" />
                    Portal
                  </a>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="hidden sm:inline-flex rounded-xl bg-white text-primary hover:bg-white/90 px-7 shadow-lg"
                  onClick={() => setSignupOpen(true)}
                >
                  Get Started
                </Button>
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

                    {isLoggedIn ? (
                      <>
                        <SheetClose asChild>
                          <Link
                            to="/get-onboard"
                            className="text-lg font-medium hover:text-primary flex items-center gap-2"
                          >
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <a
                            href={getPortalUrl()}
                            className="text-lg font-medium hover:text-primary flex items-center gap-2"
                          >
                            <Smartphone className="h-5 w-5" />
                            Portal
                          </a>
                        </SheetClose>
                      </>
                    ) : (
                      <SheetClose asChild>
                        <button
                          onClick={() => setSignupOpen(true)}
                          className="text-lg font-medium hover:text-primary text-left"
                        >
                          Get Started
                        </button>
                      </SheetClose>
                    )}

                    <SheetClose asChild>
                      <Link to="/book-demo">
                        <Button className="w-full mt-4 rounded-xl">
                          Book a Demo
                        </Button>
                      </Link>
                    </SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <SignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
      />
    </>
  );
};

export default Header;
