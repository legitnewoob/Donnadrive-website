import { MessageSquare, Calendar, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const BeautyOfDonnaDrive = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Messaging",
      description: "Bookings, feedback, and reminders — all handled in your everyday chat."
    },
    {
      icon: Calendar,
      title: "Google Calendar Integration",
      description: "Automatically updates your schedule with each new lesson."
    },
    {
      icon: LayoutDashboard,
      title: "Student Portal",
      description: "All your learners — progress, test dates, payments — in one place, not a spreadsheet."
    },
    {
      icon: Settings,
      title: "Easy Setup",
      description: "Start in minutes — Donna works with the tools you already know and trust."
    }
  ];

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary" id="beauty">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-8 sm:mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">
            The beauty of Donna Drive? It all works through WhatsApp.
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto px-4">
            No new apps. No complicated setup. Donna Drive connects seamlessly with the tools you already use — WhatsApp and Google Calendar — plus your own Donna Portal to make your day run smoothly.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6 max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12">
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-xl p-3 sm:p-6 lg:p-7 shadow-lg hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
            >
              <div className="flex flex-col items-center text-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <h3 className="text-xs sm:text-lg font-bold text-foreground leading-tight">{feature.title}</h3>
              </div>
              <p className="text-[10px] sm:text-base text-muted-foreground leading-relaxed text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={scrollToHowItWorks}
            className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-6 sm:px-8"
          >
            See How It Works
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default BeautyOfDonnaDrive;
