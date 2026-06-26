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

const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg px-6 py-3">
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
              <>
                <a
                  href="#features"
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  How It Works
                </a>

                <a
                  href="#pricing"
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  Pricing
                </a>

                <a
                  href="#faq"
                  className="text-black/90 hover:text-black transition-colors font-medium"
                >
                  FAQ
                </a>
              </>
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
              className={`transition-colors font-medium ${
                pathname.startsWith("/blog")
                  ? "text-black"
                  : "text-black/90 hover:text-black"
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link to="/book-demo" className="hidden sm:block">
              <Button
                size="lg"
                className="rounded-xl bg-white text-primary hover:bg-white/90 px-7 shadow-lg"
              >
                Book a Demo
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
                    <>
                      <SheetClose asChild>
                        <a
                          href="#features"
                          className="text-lg font-medium hover:text-primary"
                        >
                          Features
                        </a>
                      </SheetClose>

                      <SheetClose asChild>
                        <a
                          href="#how-it-works"
                          className="text-lg font-medium hover:text-primary"
                        >
                          How It Works
                        </a>
                      </SheetClose>

                      <SheetClose asChild>
                        <a
                          href="#pricing"
                          className="text-lg font-medium hover:text-primary"
                        >
                          Pricing
                        </a>
                      </SheetClose>

                      <SheetClose asChild>
                        <a
                          href="#faq"
                          className="text-lg font-medium hover:text-primary"
                        >
                          FAQ
                        </a>
                      </SheetClose>
                    </>
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
  );
};

export default Header;