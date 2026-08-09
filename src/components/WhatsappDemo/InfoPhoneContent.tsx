import { LucideIcon, Users, CalendarDays, Clock } from "lucide-react";
import { motion, MotionStyle } from "framer-motion";

interface InfoPhoneItem {
  icon: LucideIcon;
  label: string;
}

export type InfoPhoneTab = "students" | "calendar" | "donna";

const TABS: { id: InfoPhoneTab; label: string; icon: LucideIcon }[] = [
  { id: "students", label: "Students", icon: Users },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "donna", label: "Donna", icon: Clock },
];

interface InfoPhoneContentProps {
  tabNumber: number;
  title: string;
  oneLiner: string;
  items: InfoPhoneItem[];
  activeTab: InfoPhoneTab;
  headerStyle?: MotionStyle;
  listStyle?: MotionStyle;
}

const InfoPhoneContent = ({
  tabNumber,
  title,
  oneLiner,
  items,
  activeTab,
  headerStyle,
  listStyle,
}: InfoPhoneContentProps) => {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden px-5 py-6">
        <motion.div style={headerStyle}>
          <h4 className="text-xl font-black tracking-tight">
            <span className="text-primary">TAB {tabNumber}</span>{" "}
            <span className="text-[#1A1A1A] uppercase">{title}</span>
          </h4>

          <p className="mt-2 text-sm leading-5 text-[#1A1A1A]/60">
            {oneLiner}
          </p>
        </motion.div>

        {/* Card-style rows instead of plain bullets — each a soft tinted
            pill with the icon in its own rounded square, closer to a real
            settings/feature list than a bare icon + text line. */}
        <motion.div style={listStyle} className="mt-5 space-y-2">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl bg-black/[0.035] px-3 py-2.5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
              </div>
              <span className="text-[13px] leading-[1.35] font-medium text-[#1A1A1A]/80">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom tab bar, matching the live demo phone's own nav — the
          matching tab stays highlighted, with a coral indicator bar ABOVE
          it (mirroring the live demo phone's own active-tab treatment),
          so this reads as "the same app, on a different tab" rather than
          an unrelated info card. */}
      <div className="flex items-center justify-around border-t border-black/5 px-2 pt-2 pb-2">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === activeTab;
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <span
                className={`mb-1 h-[3px] w-6 rounded-full ${active ? "bg-primary" : "bg-transparent"}`}
              />
              <Icon
                className={`h-4 w-4 ${active ? "text-primary" : "text-[#1A1A1A]/35"}`}
                strokeWidth={1.75}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-primary" : "text-[#1A1A1A]/35"}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfoPhoneContent;
