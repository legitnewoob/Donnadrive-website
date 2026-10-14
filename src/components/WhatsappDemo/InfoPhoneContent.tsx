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
  title: string;
  oneLiner: string;
  items: InfoPhoneItem[];
  activeTab: InfoPhoneTab;
  headerStyle?: MotionStyle;
  listStyle?: MotionStyle;
}

const InfoPhoneContent = ({
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
          <h4 className="text-xl font-black tracking-tight text-[#1A1A1A]">
            {title}
          </h4>

          <p className="mt-2 text-sm leading-5 text-[#1A1A1A]/60">
            {oneLiner}
          </p>
        </motion.div>

        <motion.div style={listStyle} className="mt-6 space-y-3.5">
          {items.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              </div>
              <span className="text-sm leading-5 text-[#1A1A1A]/75">
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom tab bar, matching the live demo phone's own nav — the
          matching tab stays highlighted so this reads as "the same app,
          on a different tab" rather than an unrelated info card. */}
      <div className="flex items-center justify-around border-t border-black/5 px-2 py-2.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === activeTab;
          return (
            <div key={id} className="flex flex-col items-center gap-1">
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
