import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Heart,
  Mail,
  Linkedin,
  Twitter,
} from "lucide-react";

import donnaLogo from "@/assets/donna-drive-logo.png";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">

        {/* Top */}

        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <img
              src={donnaLogo}
              alt="Donna Drive"
              className="h-11 w-auto"
            />

            <p className="mt-6 max-w-sm leading-8 text-muted-foreground">
              The AI receptionist built for driving instructors.
              Donna handles bookings, calendars and learner
              communication so you can spend more time teaching.
            </p>

            <div className="mt-8 flex items-center gap-4">

              <a
                href="mailto:info@smarterwayy.co.uk"
                className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:bg-primary hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:bg-primary hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </a>

              <a
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl border transition hover:bg-primary hover:text-white"
              >
                <Twitter className="h-5 w-5" />
              </a>

            </div>

          </div>

          {/* Product */}

          <div>

            <h3 className="font-bold">
              Product
            </h3>

            <div className="mt-6 space-y-4">

              <a
                href="#features"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Features
              </a>

              <a
                href="#pricing"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Pricing
              </a>

              <Link
                to="/book-demo"
                className="flex items-center gap-1 text-muted-foreground transition hover:text-primary"
              >
                Book Demo

                <ArrowUpRight className="h-4 w-4" />

              </Link>

            </div>

          </div>

          {/* Company */}

          <div>

            <h3 className="font-bold">
              Company
            </h3>

            <div className="mt-6 space-y-4">

              <Link
                to="/blog"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Blog
              </Link>

              <Link
                to="/get-onboard"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Get Onboard
              </Link>

              <a
                href="mailto:info@smarterwayy.co.uk"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Contact
              </a>

            </div>

          </div>

          {/* Legal */}

          <div>

            <h3 className="font-bold">
              Legal
            </h3>

            <div className="mt-6 space-y-4">

              <Link
                to="/privacy-policy"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Privacy Policy
              </Link>

              <Link
                to="/terms-of-service"
                className="block text-muted-foreground transition hover:text-primary"
              >
                Terms of Service
              </Link>

            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="my-10 h-px bg-border" />

        {/* Bottom */}

        <div className="flex flex-col items-center justify-between gap-5 text-sm text-muted-foreground md:flex-row">

          <p>
            © {new Date().getFullYear()} Donna Drive. All rights reserved.
          </p>

          <div className="flex items-center gap-2">

            <span>
              Made with
            </span>

            <Heart className="h-4 w-4 fill-primary text-primary" />

            <span>
              for driving instructors.
            </span>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;