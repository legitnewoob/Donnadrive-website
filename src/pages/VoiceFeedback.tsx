import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Bot, UserCheck, MessageSquare, Brain, Lock, Lightbulb, ArrowLeft, ArrowRight } from "lucide-react";

const VoiceFeedback = () => {
  const timelineSteps = [
    {
      icon: Mic,
      title: "Speak Your Feedback",
      text: "After each lesson, simply speak your notes to Donna via WhatsApp.",
      example: "'Chris made very good progress on his clutch control on flat surfaces, but needs more confidence when performing a hill start, where he occasionally stalls'",
      subtext: "No typing. Just talk. Donna understands.",
      color: "teal"
    },
    {
      icon: Bot,
      title: "Donna Transcribes & Organizes",
      text: "Donna converts your voice into accurate text, logs it under the correct learner's Portal profile, and timestamps it.",
      subtext: "All your records — organized, easy, private, and accessible anywhere.",
      color: "coral"
    },
    {
      icon: UserCheck,
      title: "Feedback Lives in Their Profile",
      text: "Every note is saved straight to the learner's Portal profile, so you can look back before their next lesson and pick up exactly where you left off.",
      subtext: "No more digging through old messages.",
      color: "teal"
    }
  ];

  const benefits = [
    {
      icon: Mic,
      title: "No more typing or manual notes",
    },
    {
      icon: Brain,
      title: "Never forget a learner's progress",
    },
    {
      icon: Lock,
      title: "Feedback stored securely and privately",
    },
    {
      icon: Lightbulb,
      title: "Smarter lessons every time you teach",
    }
  ];

  const exampleSteps = [
    "Charlie completes his lesson",
    "You speak: 'Charlie showed great confidence on roundabouts but needs more work on clutch control'",
    "Donna transcribes and saves to Charlie's record",
    "Two weeks later, Donna reminds you before Charlie's next lesson"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground py-6 sm:py-10 lg:py-14">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center space-y-3 sm:space-y-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold leading-tight">
              Talk, Don't Type — Let Donna Handle Lesson Feedback
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
              After every lesson, simply speak your feedback to Donna via WhatsApp. She transcribes it, stores it securely, and reminds you what to focus on next time — so you always pick up right where you left off.
            </p>
            <Link to="/book-demo">
              <Button variant="accent" size="lg" className="text-sm sm:text-base px-6 py-3 mt-3">
                Join the Waitlist
              </Button>
            </Link>
            
            <div className="pt-4 sm:pt-6 flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-foreground/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline: How It Works */}
      <section className="py-6 sm:py-10 lg:py-14 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-5 sm:mb-7 lg:mb-9"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground mb-2">
              How It Works
            </h2>
          </motion.div>

          {/* Desktop: Horizontal Timeline */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-16 left-0 right-0 h-1 bg-border/30" style={{ left: '16.66%', right: '16.66%' }}></div>
              
              <div className="grid grid-cols-3 gap-8">
                {timelineSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="relative"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.2 }}
                  >
                    <div className="bg-card rounded-xl p-5 shadow-card hover:shadow-elegant transition-shadow duration-300 relative">
                      {/* Step number badge */}
                      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-base z-10 ${
                        step.color === 'teal' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="pt-5 space-y-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto ${
                          step.color === 'teal' ? 'bg-primary/10' : 'bg-accent/10'
                        }`}>
                          <step.icon className={`w-5 h-5 ${step.color === 'teal' ? 'text-primary' : 'text-accent'}`} />
                        </div>
                        
                        <h3 className="text-lg font-bold text-card-foreground text-center">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-center">{step.text}</p>
                        
                        {step.example && (
                          <div className="bg-muted/50 rounded-lg p-3 mt-2">
                            <p className="text-xs text-muted-foreground italic">"{step.example}"</p>
                          </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground/80 text-center italic">{step.subtext}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile: Vertical Stack */}
          {/* Mobile: Grid 2 columns */}
          <div className="lg:hidden grid grid-cols-2 gap-3">
            {timelineSteps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              >
                <div className="bg-card rounded-xl p-2.5 shadow-card h-full flex flex-col">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mx-auto mb-2 ${
                    step.color === 'teal' ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center text-center">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${
                      step.color === 'teal' ? 'bg-primary/10' : 'bg-accent/10'
                    }`}>
                      <step.icon className={`w-3.5 h-3.5 ${step.color === 'teal' ? 'text-primary' : 'text-accent'}`} />
                    </div>
                    <h3 className="text-[10px] font-bold text-card-foreground mb-1.5 leading-tight">{step.title}</h3>
                    
                    <p className="text-[9px] text-muted-foreground leading-relaxed mb-1.5">{step.text}</p>
                    
                    {step.example && (
                      <div className="bg-muted/50 rounded-lg p-1.5 mb-1.5 w-full">
                        <p className="text-[8px] text-muted-foreground italic line-clamp-3">"{step.example}"</p>
                      </div>
                    )}
                    
                    <p className="text-[8px] text-muted-foreground/80 italic mt-auto">{step.subtext}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Scenario */}
      <section className="py-6 sm:py-10 lg:py-14 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-5 text-center">
              See Donna in Action — Charlie's Lesson Example
            </h2>
            
            <div className="bg-gradient-primary rounded-xl p-6 sm:p-8 lg:p-10 text-primary-foreground mb-8">
              <p className="text-lg sm:text-xl leading-relaxed mb-6">
                Charlie completes a lesson. You speak into Donna via WhatsApp:<br/>
                <span className="font-bold italic text-xl sm:text-2xl">"Charlie showed great confidence on roundabouts but needs more work on clutch control."</span>
              </p>
              <p className="text-lg sm:text-xl leading-relaxed">
                Donna instantly transcribes it, adds it to Charlie's learner record, and reminds you two weeks later — before his next lesson — exactly what to focus on.
              </p>
              <p className="text-base sm:text-lg leading-relaxed mt-6 opacity-90">
                💡 Humans forget. Donna doesn't. No more messy diaries or lost feedback reminders.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {exampleSteps.map((step, index) => (
                <motion.div
                  key={index}
                  className="relative bg-card rounded-lg p-2.5 sm:p-4 shadow-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.1 }}
                >
                  <div className="w-7 h-7 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm mx-auto mb-2 sm:mb-3">
                    {index + 1}
                  </div>
                  <p className="text-[10px] sm:text-sm text-card-foreground font-medium leading-relaxed text-center">{step}</p>
                  {index < exampleSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-6 sm:py-10 lg:py-14 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-5 sm:mb-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold text-foreground mb-2">
              Why Instructors Love the Voice Feedback Assistant
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-card rounded-xl p-2.5 sm:p-4 shadow-card hover:shadow-elegant transition-shadow duration-300 text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              >
                <div className="w-7 h-7 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  <benefit.icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-[10px] sm:text-base font-bold text-card-foreground leading-tight">{benefit.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-6 sm:py-10 lg:py-14 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-3 sm:space-y-5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-lg sm:text-xl lg:text-3xl font-bold">
              Simplify Your Lessons with Donna Drive
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-primary-foreground/90">
              Speak once — Donna remembers everything for you.
            </p>
            <Link to="/book-demo">
              <Button variant="accent" size="lg" className="text-sm sm:text-base px-6 py-3">
                Join the Waitlist for Early Access
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default VoiceFeedback;