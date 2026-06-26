import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, MapPin, CalendarOff, Users, Navigation, Shield, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";

const SmartCalendar = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: {
        staggerChildren: 0.1
      }
    },
    viewport: { once: true }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const setupSteps = [
    {
      icon: Calendar,
      title: "Connect Google Calendar",
      description: "Link your existing calendar in one click"
    },
    {
      icon: Clock,
      title: "Set Hours & Block Time Off",
      description: "Define working hours and block unavailable times"
    },
    {
      icon: CheckCircle,
      title: "Share Your Link — Done!",
      description: "Learners book via WhatsApp, you're ready to go"
    }
  ];

  const understandsCards = [
    {
      icon: Clock,
      title: "Working Hours",
      description: "Your start and end times each day"
    },
    {
      icon: CalendarOff,
      title: "Time Off",
      description: "Blocked hours, days off, holidays — Donna won't suggest these times"
    },
    {
      icon: Navigation,
      title: "Distance Between Lessons",
      description: "Uses Google Maps to calculate travel time"
    },
    {
      icon: Shield,
      title: "Buffer Time",
      description: "Travel gaps between bookings"
    },
    {
      icon: MapPin,
      title: "Your Teaching Areas",
      description: "Where you're willing to travel"
    },
    {
      icon: Users,
      title: "Existing Bookings",
      description: "Never double-books you"
    }
  ];

  const faqs = [
    {
      question: "How do I block time off?",
      answer: "Just block it in your Google Calendar — Donna sees it instantly and won't suggest those times to learners."
    },
    {
      question: "What if I book a lesson manually?",
      answer: "Donna sees it immediately through your calendar sync. She'll work around all your existing bookings."
    },
    {
      question: "Do my learners need an app?",
      answer: "No, they just use WhatsApp — something they already have and use every day."
    },
    {
      question: "How long does setup really take?",
      answer: "5 minutes. Connect your calendar, set your preferences, and you're done."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-28">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
          <motion.div
            className="max-w-3xl mx-auto text-center space-y-6"
            {...fadeInUp}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Set up in 5 minutes.
              <br />
              <span className="text-accent">Never chase bookings again.</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Donna syncs with Google Calendar and uses Google Maps to intelligently schedule lessons. Block time off, and she'll respect your boundaries.
            </p>
            
            <div className="flex flex-row gap-2 sm:gap-3 justify-center pt-4 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-2 justify-center text-[10px] sm:text-base">
                <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <span>Google Calendar</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 justify-center text-[10px] sm:text-base">
                <MapPin className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <span>Google Maps</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 justify-center text-[10px] sm:text-base">
                <CalendarOff className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                <span>Block time off</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/book-demo">
                <Button variant="accent" size="lg" className="text-base px-8 py-3">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple 3-Step Setup
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in minutes, not hours. No technical knowledge required.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-8 max-w-4xl mx-auto items-start"
            {...staggerContainer}
          >
            {setupSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative text-center p-4 sm:p-6"
                {...staggerItem}
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <step.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="absolute top-7 sm:top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-10 text-center"
            {...fadeInUp}
          >
            <div className="inline-flex items-center gap-3 bg-primary/5 rounded-full px-6 py-3 border border-primary/10">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">Need help?</span> Our team will walk you through setup on a free onboarding call.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Donna Understands */}
      <section className="py-16 sm:py-20 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Donna Understands
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              She reads your calendar and preferences to make smart decisions on your behalf.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-5xl mx-auto items-start"
            {...staggerContainer}
          >
            {understandsCards.map((card, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-2.5 sm:p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
                {...staggerItem}
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-2 sm:mb-4">
                  <card.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-xs sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{card.title}</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{card.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Google */}
      <section className="py-16 sm:py-20 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="max-w-3xl mx-auto text-center" {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Google Calendar & Maps?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              No new apps to learn. Donna works with tools you already use every day.
            </p>
            
            <div className="grid grid-cols-2 gap-2 sm:gap-6">
              <div className="bg-card rounded-xl p-3 sm:p-6 border border-border">
                <Calendar className="w-6 h-6 sm:w-10 sm:h-10 text-primary mx-auto mb-2 sm:mb-4" />
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">Google Calendar</h3>
                <p className="text-muted-foreground text-[10px] sm:text-sm">
                  Block time directly — Donna respects your boundaries.
                </p>
              </div>
              <div className="bg-card rounded-xl p-3 sm:p-6 border border-border">
                <MapPin className="w-6 h-6 sm:w-10 sm:h-10 text-primary mx-auto mb-2 sm:mb-4" />
                <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-xs sm:text-base">Google Maps</h3>
                <p className="text-muted-foreground text-[10px] sm:text-sm">
                  Accurate travel times so you're never rushed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Common Questions
            </h2>
          </motion.div>

          <motion.div 
            className="max-w-2xl mx-auto space-y-4"
            {...staggerContainer}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-6 border border-border"
                {...staggerItem}
              >
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto" {...fadeInUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to get your evenings back?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Set up in 5 minutes. Let Donna handle the booking chaos.
            </p>
            <Link to="/book-demo">
              <Button variant="accent" size="lg" className="text-base px-8 py-3">
                Book a Demo
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SmartCalendar;
