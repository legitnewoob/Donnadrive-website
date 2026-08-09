import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Calendar, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      icon: MessageCircle,
      title: "Learner messages Donna on WhatsApp",
      description: "\"Hi Donna, can I book a lesson this week?\""
    },
    {
      number: "2",
      icon: Calendar,
      title: "Donna checks your calendar",
      description: "She looks at your availability, nearby lessons, and working hours."
    },
    {
      number: "3",
      icon: CheckCircle,
      title: "Lesson booked. You're done.",
      description: "Your calendar updates automatically. No back-and-forth messaging."
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background" id="how-it-works">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Booking a lesson takes 30 seconds. You don't need to do anything.
          </p>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                className="flex gap-4 sm:gap-6 items-start"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.15 }}
              >
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {step.number}
                </div>
                <div className="pt-2">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center mt-10 sm:mt-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
          >
            <Link to="/book-demo">
              <Button variant="accent" size="lg" className="text-base px-8 py-3">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
