import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Fuel, TrendingDown, CheckCircle, Settings, Route, MapPinned, Brain, Calendar } from "lucide-react";
import Header from "@/components/Header";
import beforeRoute from "@/assets/before-route.png";
import afterRoute from "@/assets/after-route.png";
import { Helmet } from "react-helmet";

const RouteOptimization = () => {
  return (
    <>
      <Helmet>
        <title>Route Optimization for Driving Instructors — Donna Drive</title>
        <meta name="description" content="Save time and fuel with Donna Drive's smart route optimization. Auto-arrange lesson bookings by location so you teach more and drive less. Book a demo." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-20 pb-2">
          <Link to="/#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Features
          </Link>
        </div>

        {/* Hero Section */}
        <section className="py-6 sm:py-10 lg:py-14 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Heading */}
              <motion.div 
                className="text-center mb-5 sm:mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
                  Teach more. Drive less.
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-3xl mx-auto">
                  Donna Drive automatically schedules lessons by location so you spend less time on the road and more time teaching.
                </p>
                
                {/* Benefits bullets */}
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Reduce travel time between lessons</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <Fuel className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Lower fuel costs</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <span className="text-sm sm:text-base text-foreground">Fit more lessons into the day or finish earlier</span>
                  </div>
                </div>

                <Link to="/book-demo">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto">
                    See Route Optimization — Book a Demo
                  </Button>
                </Link>
              </motion.div>

              {/* Before/After Images */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:gap-6 mt-6 sm:mt-12">
                {/* Before Image */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
                  className="bg-muted/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-6"
                >
                  <div className="relative">
                    <img 
                      src={beforeRoute} 
                      alt="Before Donna Drive - Scattered lessons and wasted miles"
                      className="w-full rounded-lg sm:rounded-xl shadow-card border border-border"
                    />
                  </div>
                  <p className="text-center mt-2 sm:mt-4 text-[10px] sm:text-sm lg:text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">Before</span><br />
                    Scattered lessons
                  </p>
                </motion.div>

                {/* After Image */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
                  className="bg-muted/30 rounded-xl sm:rounded-2xl p-2 sm:p-4 lg:p-6"
                >
                  <div className="relative">
                    <img 
                      src={afterRoute} 
                      alt="After Donna Drive - Clustered lessons, optimized routes, and less driving"
                      className="w-full rounded-lg sm:rounded-xl shadow-card border border-border"
                      loading="eager"
                      fetchPriority="high"
                    />
                  </div>
                  <p className="text-center mt-2 sm:mt-4 text-[10px] sm:text-sm lg:text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">After</span><br />
                    Optimized routes
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-6 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center mb-5 sm:mb-8 lg:mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-4">
                How Route Optimization Works
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto">
                Donna Drive uses learner locations and your calendar to suggest bookings close together — minimising travel and maximising teaching time.
              </p>
            </motion.div>

            {/* Steps - Vertical on mobile, horizontal on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
              {[
                {
                  icon: MapPin,
                  title: "We collect learner locations",
                  description: "Learners share their pickup postcode/address in WhatsApp when they first message Donna."
                },
                {
                  icon: Calendar,
                  title: "Donna checks availability & proximity",
                  description: "When a learner asks to book, Donna cross-references your Google Calendar and nearby scheduled lessons."
                },
                {
                  icon: CheckCircle,
                  title: "Smart slot suggestions",
                  description: "Donna suggests booking slots that cluster lessons geographically, keeping travel short."
                },
                {
                  icon: Route,
                  title: "Optimised daily route",
                  description: "Every morning Donna sends you your optimised route: home → first lesson → last lesson → home."
                },
                {
                  icon: Brain,
                  title: "Ongoing learning",
                  description: "Donna gets smarter over time, learning common pickup points and preferred slots to improve suggestions."
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-2.5 sm:p-5 shadow-card hover:shadow-elegant transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                    <step.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-[10px] sm:text-base lg:text-lg font-bold text-card-foreground mb-1 sm:mb-2 text-center">
                    {index + 1}. {step.title}
                  </h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground leading-relaxed text-center">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Key Benefits Grid */}
        <section className="py-8 sm:py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-lg sm:text-2xl lg:text-3xl font-bold text-center text-foreground mb-6 sm:mb-8 lg:mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Key Benefits
            </motion.h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
              {[
                {
                  icon: Clock,
                  title: "Save Time",
                  description: "Less time driving between lessons equals more teaching hours."
                },
                {
                  icon: Fuel,
                  title: "Lower Fuel Costs",
                  description: "Drive fewer miles each day with clustered lessons."
                },
                {
                  icon: TrendingDown,
                  title: "Better Work-Life Balance",
                  description: "Finish earlier or fit in more sessions without extra travel."
                },
                {
                  icon: MapPinned,
                  title: "Smart Suggestions",
                  description: "Donna suggests slots close to other bookings automatically."
                },
                {
                  icon: Settings,
                  title: "Custom Rules",
                  description: "Respect working hours, travel buffer, and away time."
                },
                {
                  icon: CheckCircle,
                  title: "Manual Override",
                  description: "Instructors can always accept, edit, or decline suggested slots."
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-2.5 sm:p-5 shadow-card hover:shadow-elegant transition-all hover:scale-105"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-2 sm:mb-4 mx-auto">
                    <benefit.icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-lg font-bold text-card-foreground mb-1 sm:mb-2 text-center">
                    {benefit.title}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground text-center">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


        {/* Statistics */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
              {[
                { stat: "Up to 30%", label: "Travel time reduced" },
                { stat: "50+ miles", label: "Saved per week" },
                { stat: "2+ hours", label: "More teaching time" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-3 sm:p-6 text-center shadow-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-lg sm:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">
                    {item.stat}
                  </div>
                  <div className="text-[10px] sm:text-sm lg:text-base text-muted-foreground">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              *Results vary by region and schedule.
            </p>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-12 sm:py-16 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Ready to Optimize Your Routes?
              </h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                See route optimization in action and discover how much time you could save.
              </p>
              <Link to="/book-demo">
                <Button variant="accent" size="lg">
                  Book a Demo
                </Button>
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground mt-3">
                Early access offer: 1 month free for pre-order users.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto bg-card rounded-2xl p-6 sm:p-8 shadow-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">L</span>
                </div>
                <div>
                  <p className="text-base sm:text-lg text-card-foreground italic mb-3">
                    "Since Donna has been handling my scheduling, I have time to fit an extra lesson in every day. Game changer!"
                  </p>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Liam, ADI
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 sm:py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.h2 
              className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Frequently Asked Questions
            </motion.h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "How does Donna know a learner's location?",
                  a: "When learners first message Donna, she asks for their postcode/address and saves it to their profile."
                },
                {
                  q: "Can I override suggested slots?",
                  a: "Yes — you can accept, edit, or decline any suggestion. You're always in control."
                },
                {
                  q: "Does this work with my Google Calendar?",
                  a: "Yes — Donna checks your Google Calendar and respects working hours and away times."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-5 sm:p-6 shadow-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="text-base sm:text-lg font-bold text-card-foreground mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-border lg:hidden z-40">
          <Link to="/book-demo" className="block">
            <Button variant="accent" size="lg" className="w-full">
              Book a Demo
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default RouteOptimization;
