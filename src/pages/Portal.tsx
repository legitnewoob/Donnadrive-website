import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  CreditCard,
  Clock,
  CalendarOff,
  Coffee,
  Bell,
  RefreshCw,
  XCircle,
  UserPlus,
  ArrowLeft,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/Header";

const Portal = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: { staggerChildren: 0.1 },
    },
    viewport: { once: true },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  const studentCards = [
    {
      icon: TrendingUp,
      title: "Progress, tracked automatically",
      description: "See how close every learner is to test standard — no spreadsheet required.",
    },
    {
      icon: Users,
      title: "Add or remove learners in seconds",
      description: "Keep your active roster current as learners join, pass their test, or pause lessons.",
    },
    {
      icon: CreditCard,
      title: "Log payments as they come in",
      description: "Note down what's been paid and instantly see who's owing — no more chasing a ledger.",
    },
  ];

  const calendarCards = [
    {
      icon: Calendar,
      title: "Every lesson, at a glance",
      description: "Upcoming lessons and lesson types laid out clearly, day by day.",
    },
    {
      icon: Clock,
      title: "Durations that fit your day",
      description: "Adjust how long each lesson type runs, lesson by lesson.",
    },
    {
      icon: CalendarOff,
      title: "Block out time when you need to",
      description: "Holidays, appointments, days off — block them out and Donna respects it.",
    },
    {
      icon: Coffee,
      title: "Breaks built in",
      description: "Set your lunch and breaks once — Donna won't book over them.",
    },
  ];

  const donnaCards = [
    {
      icon: XCircle,
      title: "Cancellations, with reasons",
      description: "See what got cancelled and why, the moment it happens.",
    },
    {
      icon: RefreshCw,
      title: "Reschedules",
      description: "Track every moved lesson without digging through messages.",
    },
    {
      icon: Bell,
      title: "Couldn't find a slot",
      description: "Know when a learner struggled to book, so you can step in.",
    },
    {
      icon: UserPlus,
      title: "New learners signing up",
      description: "Get notified the moment someone new joins your school.",
    },
  ];

  const faqs = [
    {
      question: "Do I still need a spreadsheet?",
      answer: "No. Progress, test dates, and payments all live in your Portal — nothing to keep updated separately.",
    },
    {
      question: "Can my learners see their own progress?",
      answer: "Their progress is tracked automatically as lessons are completed, so you always have an up-to-date picture to share with them.",
    },
    {
      question: "Does this replace WhatsApp booking?",
      answer: "No — learners still book through WhatsApp as normal. The Portal is where you manage what happens behind the scenes.",
    },
    {
      question: "Is the demo below using real data?",
      answer: "No. It's a sandboxed copy with made-up sample learners, so you can click around freely. Nothing you do in it is saved anywhere or affects a real account.",
    },
  ];

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const demoFrameRef = useRef<HTMLIFrameElement>(null);

  // Each step maps to one of the Portal's three real tabs. Stepping through
  // the guide also drives the live demo to the matching tab, so what's on
  // screen always lines up with what the step is describing.
  const tutorialSteps = [
    {
      tab: "students",
      icon: Users,
      title: "Students",
      bullets: [
        "View every student — their details, money owed, and payment history.",
        "See each student's next lesson and upcoming bookings at a glance.",
        "Read feedback logged from their past lessons.",
      ],
    },
    {
      tab: "calendar",
      icon: Calendar,
      title: "Calendar",
      bullets: [
        "View lessons by day, week, or month.",
        "Manually add a lesson or book off time.",
        "Add feedback for lessons once they're done.",
        "Tap the cog to set lesson lengths, working hours, breaks, and blocked days.",
      ],
    },
    {
      tab: "donna",
      icon: Activity,
      title: "Donna",
      bullets: [
        "See every booking, cancellation, and reschedule the moment it happens.",
        "Get notified when a new learner registers.",
        "Know when a learner couldn't find a slot, so you can step in.",
      ],
    },
  ];

  useEffect(() => {
    if (showTutorial && demoLoaded) {
      demoFrameRef.current?.contentWindow?.postMessage(
        { type: "donna-demo-set-tab", tab: tutorialSteps[tutorialStep].tab },
        "*"
      );
    }
  }, [showTutorial, demoLoaded, tutorialStep]);

  function toggleTutorial() {
    setShowTutorial((v) => !v);
    setTutorialStep(0);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-10 sm:py-14 lg:py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <motion.div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6" {...fadeInUp}>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Everything about your learners,
              <br />
              <span className="text-accent">in one place.</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/90 leading-relaxed max-w-xl mx-auto">
              The Donna Portal replaces the spreadsheet — students, calendar, and activity, all in one app built for instructors.
            </p>
            <div className="pt-2">
              <Link to="/book-demo">
                <Button variant="accent" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="py-10 sm:py-14 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8 sm:mb-10" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Try It Yourself
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
              This is a live, click-around demo of the real Portal — loaded with sample students so you can explore safely.
            </p>
          </motion.div>

          <motion.div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center" {...fadeInUp}>
            <div className="max-w-[280px] w-full">
              <div className="rounded-[1.5rem] border-4 border-foreground/90 shadow-elegant overflow-hidden bg-foreground/90">
                <iframe
                  ref={demoFrameRef}
                  src="/demo/index.html"
                  title="Donna Drive Portal demo"
                  className="w-full bg-background"
                  style={{ height: "min(620px, 72vh)", border: "none" }}
                  onLoad={() => setDemoLoaded(true)}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTutorial}
                className="w-full mt-3 text-xs sm:text-sm gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showTutorial ? "Hide walkthrough" : "Show me how it works"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-3">
                Sample data only — nothing you do here is saved or connected to a real account.
              </p>
            </div>

            <AnimatePresence>
              {showTutorial && (
                <motion.div
                  className="w-full max-w-[280px] bg-card border border-border rounded-xl p-4 shadow-card"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      type="button"
                      aria-label="Previous step"
                      disabled={tutorialStep === 0}
                      onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
                      className="flex-shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex-1 flex items-center justify-center gap-1.5">
                      {tutorialSteps.map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${i === tutorialStep ? "bg-primary" : "bg-border"}`}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      aria-label="Next step"
                      disabled={tutorialStep === tutorialSteps.length - 1}
                      onClick={() => setTutorialStep((s) => Math.min(tutorialSteps.length - 1, s + 1))}
                      className="flex-shrink-0 w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      {(() => {
                        const StepIcon = tutorialSteps[tutorialStep].icon;
                        return <StepIcon className="w-5 h-5 text-primary" />;
                      })()}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {tutorialSteps[tutorialStep].title}
                    </h4>
                  </div>

                  <ul className="space-y-1.5">
                    {tutorialSteps[tutorialStep].bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="flex-shrink-0 w-1 h-1 rounded-full bg-primary mt-2" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Students */}
      <section className="py-10 sm:py-14 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8 sm:mb-10" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Students
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
              Every learner, with everything you need to know about them.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto items-start" {...staggerContainer}>
            {studentCards.map((card, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
                {...staggerItem}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Calendar */}
      <section className="py-10 sm:py-14 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8 sm:mb-10" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Calendar
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
              Your working day, exactly the way you want it.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto items-start" {...staggerContainer}>
            {calendarCards.map((card, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
                {...staggerItem}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Donna Tab */}
      <section className="py-10 sm:py-14 lg:py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8 sm:mb-10" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              The Donna Tab
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-xl mx-auto">
              Stay on top of things without checking manually.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 max-w-5xl mx-auto items-start" {...staggerContainer}>
            {donnaCards.map((card, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow"
                {...staggerItem}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{card.title}</h3>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 sm:py-14 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-8 sm:mb-10" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3">
              Common Questions
            </h2>
          </motion.div>

          <motion.div className="max-w-2xl mx-auto space-y-3 sm:space-y-4" {...staggerContainer}>
            {faqs.map((faq, index) => (
              <motion.div key={index} className="bg-card rounded-xl p-5 border border-border" {...staggerItem}>
                <h3 className="font-semibold text-foreground mb-1.5 text-sm sm:text-base">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 sm:py-14 lg:py-20 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-xl mx-auto" {...fadeInUp}>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3">
              Ready to leave the spreadsheet behind?
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base lg:text-lg mb-6">
              See the real Portal set up for your school.
            </p>
            <Link to="/book-demo">
              <Button variant="accent" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3">
                Book a Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Portal;
