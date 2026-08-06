import { motion } from "framer-motion";

import PortalShowcase from "./PortalShowcase";
import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

const WhatsAppDemo = () => {
  return (
    <section
      id="whatsapp-demo"
      className="relative pt-12 lg:pt-16 pb-32 lg:pb-40 bg-gradient-to-b from-background to-orange-50/30"
    >
      {/* Note: no overflow-hidden on the section itself — that would break
          the portal showcase's scroll-pinned sticky positioning below. The
          map img is self-contained (inset-0/w-full/h-full) so it doesn't
          need one, and the blur blobs get their own clipped layer instead. */}
      <RoundaboutMapBackground />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-24 h-72 w-72 rounded-full bg-primary/10 blur-2xl md:blur-3xl" />
        <div className="absolute right-0 bottom-20 h-96 w-96 rounded-full bg-orange-300/10 blur-2xl md:blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* Small connective line bridging MeetDonna into this section. */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold tracking-wide text-muted-foreground mb-10"
        >
          <span className="text-foreground underline decoration-primary decoration-4 underline-offset-4">
            Donna
          </span>{" "}
          lives inside your{" "}
          <span className="text-foreground underline decoration-primary decoration-4 underline-offset-4">
            portal
          </span>
          .
        </motion.p>

        {/* Portal showcase — heading text sits beside the demo phone and
            fades as it slides left (desktop); a simple centered heading
            + static stack on smaller screens / reduced motion. */}

        <PortalShowcase />

      </div>
    </section>
  );
};

export default WhatsAppDemo;
