import { ReactNode } from "react";

interface PhoneShellProps {
  children: ReactNode;
  width?: number;
  screenHeight?: string;
  /** Ambient glow + floating ground shadow — on for a standalone hero phone, off when several phones sit close together in the showcase. */
  decorative?: boolean;
  className?: string;
}

/**
 * Thin coral case + translucent glass shell shared by the interactive demo
 * phone and the info phones in the portal showcase, so all four read as one
 * consistent "phone mockup" family.
 */
const PhoneShell = ({
  children,
  width = 280,
  screenHeight = "min(620px, 72vh)",
  decorative = true,
  className = "",
}: PhoneShellProps) => {
  return (
    <div className={`relative ${className}`} style={{ width }}>
      {decorative && (
        <div className="absolute left-1/2 top-10 -z-10 h-[360px] w-[92%] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/30 to-orange-300/20 blur-3xl" />
      )}

      {/* Extra top padding gives the notch its own bezel band so it never overlaps the screen's own content. */}
      <div className="relative rounded-[2.25rem] border-[3px] border-primary bg-white/20 pt-8 pb-2.5 px-2.5 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.35)]">

        {/* Sheen — a soft diagonal highlight to sell the glass */}
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/60 via-white/10 to-transparent" />

        {/* Dynamic-island style notch */}
        <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black/80 backdrop-blur-md" />

        {/* Screen */}
        <div
          className="relative overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/5"
          style={{ height: screenHeight }}
        >
          {children}
        </div>
      </div>

      {decorative && (
        <div className="mx-auto mt-6 h-6 w-32 rounded-full bg-black/10 blur-xl" />
      )}
    </div>
  );
};

export default PhoneShell;
