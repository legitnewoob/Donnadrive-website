import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import donnaDriveLogo from "@/assets/donna-drive-logo-v2.png";

/**
 * The landing page's real sections, in page order. Previously this nav
 * pointed at #features and #how-it-works, which only exist in components
 * that aren't rendered — both links did nothing. Every target below is an
 * id on a section Index.tsx actually mounts, and each of those sections
 * carries a scroll-mt so it doesn't land under this fixed header.
 */
const SECTIONS = [
  { href: "#meet-donna", label: "Meet Donna" },
  { href: "#whatsapp-demo", label: "Portal" },
  { href: "#how-donna-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
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
            {isHome ? (
              SECTIONS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  {label}
                </a>
              ))
            ) : (
              <Link
                to="/"
                className="text-black/90 hover:text-black transition-colors font-medium"
              >
                Home
              </Link>
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
           <Link to="/#pricing" className="hidden sm:block">
              <Button
                size="lg"
                className="rounded-xl bg-white text-primary hover:bg-white/90 px-7 shadow-lg"
              >
                Get Started
              </Button>
            </Link>

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
                  {isHome ? (
                    SECTIONS.map(({ href, label }) => (
                      <SheetClose asChild key={href}>
                        <a href={href} className="text-lg font-medium hover:text-primary">
                          {label}
                        </a>
                      </SheetClose>
                    ))
                  ) : (
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
                    <Link
                      to="/blog"
                      className="text-lg font-medium hover:text-primary"
                    >
                      Blog
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link
                      to="/get-onboard"
                      className="text-lg font-medium hover:text-primary"
                    >
                      Get Onboard
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Link to="/book-demo">
                      <Button className="w-full mt-4 rounded-xl">
                        Get Started
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
  );
};

export default Header;