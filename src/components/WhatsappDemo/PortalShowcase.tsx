import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, easeInOut } from "framer-motion";
import {
  Sparkles,
  Users,
  CreditCard,
  History,
  MessageSquare,
  Flag,
  CalendarDays,
  CalendarPlus,
  Tag,
  Clock,
  RefreshCw,
  UserPlus,
  AlertCircle,
  Activity,
} from "lucide-react";

import PhoneShell from "./PhoneShell";
import InfoPhoneContent, { InfoPhoneTab } from "./InfoPhoneContent";

const panels: {
  title: string;
  oneLiner: string;
  activeTab: InfoPhoneTab;
  items: { icon: typeof Users; label: string }[];
}[] = [
  {
    title: "Learners",
    oneLiner: "Everything about each learner, in one place.",
    activeTab: "students",
    items: [
      { icon: Users, label: "View and add learners" },
      { icon: CreditCard, label: "See outstanding payments at a glance" },
      { icon: History, label: "Track every lesson, past and upcoming" },
      { icon: MessageSquare, label: "Add feedback after each lesson" },
      { icon: Flag, label: "See each learner's test date" },
    ],
  },
  {
    title: "Calendar",
    oneLiner: "Your whole diary, fully in your control.",
    activeTab: "calendar",
    items: [
      { icon: CalendarDays, label: "Day, week and month views" },
      { icon: CalendarPlus, label: "Add lessons, block out time, add holidays" },
      { icon: Tag, label: "Set topics for each lesson" },
      { icon: Clock, label: "Set your standard lesson length, working hours and break times" },
    ],
  },
  {
    title: "Activity",
    oneLiner: "Stay on top of everything Donna does.",
    activeTab: "donna",
    items: [
      { icon: RefreshCw, label: "New bookings, reschedules and cancellations" },
      { icon: UserPlus, label: "Newly added learners" },
      { icon: AlertCircle, label: "Alerts when a learner couldn't find a slot" },
      { icon: Activity, label: "A running feed of recent diary and learner changes" },
    ],
  },
];

// Fixed pixel layout for the pinned showcase — every phone is the same
// size (280px, the demo phone's proven interactive width) so the four
// read as one consistent set, evenly spaced in a row.
const PHONE_W = 280;
const GAP = 20;
const SCREEN_H = "520px";
const SHELL_H = 568; // border + bezel padding + SCREEN_H, see PhoneShell

const SLOT_X = [0, 1, 2, 3].map((i) => i * (PHONE_W + GAP));
const GROUP_W = SLOT_X[3] + PHONE_W;
// Nudged right of dead-centre so the heading has room to sit to its left.
const MAIN_CENTERED_X = GROUP_W / 2 - PHONE_W / 2 + 90;

const DemoPhone = () => (
  <PhoneShell width={PHONE_W} screenHeight={SCREEN_H} decorative={false}>
    <iframe
      src="/demo/index.html"
      title="Donna Drive live demo"
      className="w-full h-full bg-white"
      style={{ border: "none" }}
    />
  </PhoneShell>
);

const PinnedShowcase = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const ease = [easeInOut, easeInOut];

  const mainX = useTransform(scrollYProgress, [0, 0.05, 0.16], [MAIN_CENTERED_X, MAIN_CENTERED_X, 0], { ease });

  // The heading sits beside the phone and disappears over the same window
  // the phone slides left in, so it's gone by the time the phone would
  // otherwise slide into its space.
  const textOpacity = useTransform(scrollYProgress, [0, 0.05, 0.16], [1, 1, 0]);

  {/* Each beat: a clear pause first, then the phone slides out from directly
      behind the PREVIOUS phone's resting slot (never the main phone, never
      "through" anything) while its own content populates in two steps —
      title first, then the list — so it reads as distinct beats rather
      than one blur: pause → title → info → phone settles. Beat windows,
      each with a ~0.04 gap of pause before the next one starts:
        beat1  0.20–0.33   beat2  0.37–0.50   beat3  0.54–0.67 */}
  {/* useTransform clamps to its first output value for any progress before
      the input range starts — so without a container opacity, a panel would
      sit fully visible at its "behind" slot from progress 0, just with
      blank content, instead of staying truly hidden until its own beat.
      This container opacity pops 0→1 in a near-instant beat at the very
      start of each panel's window (well before the header/list opacity)
      so the phone is invisible for the whole pause, then appears already
      positioned exactly behind its predecessor at the moment its beat
      begins. */}
  const panel1X = useTransform(scrollYProgress, [0.2, 0.33], [SLOT_X[0], SLOT_X[1]], { ease: [easeInOut] });
  const panel1Y = useTransform(scrollYProgress, [0.2, 0.33], [16, 0], { ease: [easeInOut] });
  const panel1Scale = useTransform(scrollYProgress, [0.2, 0.33], [0.92, 1], { ease: [easeInOut] });
  const panel1Opacity = useTransform(scrollYProgress, [0.195, 0.2], [0, 1]);
  const panel1HeaderOpacity = useTransform(scrollYProgress, [0.2, 0.24], [0, 1]);
  const panel1ListOpacity = useTransform(scrollYProgress, [0.24, 0.29], [0, 1]);

  const panel2X = useTransform(scrollYProgress, [0.37, 0.5], [SLOT_X[1], SLOT_X[2]], { ease: [easeInOut] });
  const panel2Y = useTransform(scrollYProgress, [0.37, 0.5], [16, 0], { ease: [easeInOut] });
  const panel2Scale = useTransform(scrollYProgress, [0.37, 0.5], [0.92, 1], { ease: [easeInOut] });
  const panel2Opacity = useTransform(scrollYProgress, [0.365, 0.37], [0, 1]);
  const panel2HeaderOpacity = useTransform(scrollYProgress, [0.37, 0.41], [0, 1]);
  const panel2ListOpacity = useTransform(scrollYProgress, [0.41, 0.46], [0, 1]);

  const panel3X = useTransform(scrollYProgress, [0.54, 0.67], [SLOT_X[2], SLOT_X[3]], { ease: [easeInOut] });
  const panel3Y = useTransform(scrollYProgress, [0.54, 0.67], [16, 0], { ease: [easeInOut] });
  const panel3Scale = useTransform(scrollYProgress, [0.54, 0.67], [0.92, 1], { ease: [easeInOut] });
  const panel3Opacity = useTransform(scrollYProgress, [0.535, 0.54], [0, 1]);
  const panel3HeaderOpacity = useTransform(scrollYProgress, [0.54, 0.58], [0, 1]);
  const panel3ListOpacity = useTransform(scrollYProgress, [0.58, 0.63], [0, 1]);

  const panelPosition = [
    { x: panel1X, y: panel1Y, scale: panel1Scale, opacity: panel1Opacity },
    { x: panel2X, y: panel2Y, scale: panel2Scale, opacity: panel2Opacity },
    { x: panel3X, y: panel3Y, scale: panel3Scale, opacity: panel3Opacity },
  ];

  const panelMotion = [
    { headerOpacity: panel1HeaderOpacity, listOpacity: panel1ListOpacity },
    { headerOpacity: panel2HeaderOpacity, listOpacity: panel2ListOpacity },
    { headerOpacity: panel3HeaderOpacity, listOpacity: panel3ListOpacity },
  ];

  return (
    <div ref={wrapperRef} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center">

        {/* Heading — sits to the left of the phone, fades out as the phone
            slides left into its space. */}
        <motion.div
          className="absolute left-0 top-1/2 max-w-sm translate-y-[calc(-50%+1.5rem)]"
          style={{ opacity: textOpacity }}
        >
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Try It Yourself
          </span>

          <h2 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight">
            Your Portal. Your{" "}
            <span className="underline decoration-primary decoration-[10px] underline-offset-8">
              Control.
            </span>
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A live, click-around demo of the real Portal —
            loaded with sample students so you can explore.
          </p>
        </motion.div>

        {/* Nudged down from true centre so the phones clear the floating nav bar. */}
        <div className="relative translate-y-12" style={{ width: GROUP_W, height: SHELL_H }}>

          <motion.div className="absolute top-0 left-0 z-40" style={{ x: mainX }}>
            <DemoPhone />
          </motion.div>

          {panels.map(({ title, oneLiner, items, activeTab }, i) => (
            <motion.div
              key={title}
              className="absolute top-0 left-0"
              style={{ zIndex: 30 - i * 10, ...panelPosition[i] }}
            >
              <PhoneShell width={PHONE_W} screenHeight={SCREEN_H} decorative={false}>
                <InfoPhoneContent
                  title={title}
                  oneLiner={oneLiner}
                  items={items}
                  activeTab={activeTab}
                  headerStyle={{ opacity: panelMotion[i].headerOpacity }}
                  listStyle={{ opacity: panelMotion[i].listOpacity }}
                />
              </PhoneShell>
            </motion.div>
          ))}

        </div>
      </div>
    </div>
  );
};

const StaticShowcase = () => (
  <div>
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mx-auto max-w-xl text-center"
    >
      <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
        Try It Yourself
      </span>

      <h2 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight">
        Your Portal. Your{" "}
        <span className="underline decoration-primary decoration-[10px] underline-offset-8">
          Control.
        </span>
      </h2>

      <p className="mt-6 text-lg leading-8 text-muted-foreground">
        A live, click-around demo of the real Portal —
        loaded with sample students so you can explore.
      </p>
    </motion.div>

    <div className="mt-16 flex flex-col items-center">
      <DemoPhone />
      <p className="mt-4 max-w-xs text-center text-sm text-muted-foreground">
        Sample data only — nothing you do here is saved or connected to a real account.
      </p>
    </div>

    <div className="mt-14 grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
      {panels.map((panel, index) => (
        <motion.div
          key={panel.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="flex justify-center"
        >
          <PhoneShell width={PHONE_W} screenHeight="440px" decorative={false}>
            <InfoPhoneContent {...panel} />
          </PhoneShell>
        </motion.div>
      ))}
    </div>
  </div>
);

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1280px) and (prefers-reduced-motion: no-preference)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px) and (prefers-reduced-motion: no-preference)");
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
};

const PortalShowcase = () => {
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isDesktop ? <PinnedShowcase /> : <StaticShowcase />}

      <div className="mt-8 flex flex-col items-center gap-2">
        {isDesktop && (
          <p className="text-center text-sm text-muted-foreground">
            Sample data only — nothing you do here is saved or connected to a real account.
          </p>
        )}

        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          Want the full guided tour? Explore the Portal
        </Link>
      </div>
    </div>
  );
};

export default PortalShowcase;
