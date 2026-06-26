import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageCircle, Route, LayoutDashboard } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
        <motion.div 
          className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight drop-shadow-lg">
                Donna Drive
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary-foreground/95 tracking-wide uppercase">
                Booking Assistant & Smart Calendar
              </p>
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/80 leading-relaxed max-w-xl mx-auto font-light">
              She manages your calendar, chats with learners on WhatsApp, and never takes a day off.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
            <Link to="/book-demo" className="w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Book a Demo
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-10 py-3 sm:py-4 font-semibold border-2 border-primary-foreground/40 bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:border-primary-foreground/60 backdrop-blur-sm transition-all duration-300">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Key benefits */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-6 sm:pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to="/ai-whatsapp-booking" className="flex items-center gap-1.5 sm:gap-3 justify-center sm:justify-start group hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-base underline underline-offset-2 leading-tight">AI WhatsApp</span>
            </Link>
            <Link to="/smart-calendar" className="flex items-center gap-1.5 sm:gap-3 justify-center group hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-base underline underline-offset-2 leading-tight">Smart Calendar</span>
            </Link>
            <Link to="/route-optimization" className="flex items-center gap-1.5 sm:gap-3 justify-center group hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Route className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-base underline underline-offset-2 leading-tight">Optimized Routes</span>
            </Link>
            <Link to="/portal" className="flex items-center gap-1.5 sm:gap-3 justify-center sm:justify-end group hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-base underline underline-offset-2 leading-tight">Student Portal</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
