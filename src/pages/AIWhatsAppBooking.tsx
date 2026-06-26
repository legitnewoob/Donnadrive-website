import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Clock, Calendar, MapPin, CheckCircle, UserCheck, Shield, Heart, Sparkles, ArrowRight, Phone, Users, XCircle, HelpCircle } from "lucide-react";
import Header from "@/components/Header";

const AIWhatsAppBooking = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: {},
    whileInView: {
      transition: { staggerChildren: 0.1 }
    },
    viewport: { once: true }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const bookingFlow = [
    {
      step: "1",
      title: "Learner Messages",
      description: "They text your Donna WhatsApp number — the link you share when onboarding them.",
      icon: MessageCircle
    },
    {
      step: "2",
      title: "Donna Understands",
      description: "She recognizes the intent: new booking, reschedule, question, or something else.",
      icon: Sparkles
    },
    {
      step: "3",
      title: "Checks Your Calendar",
      description: "Donna reviews your availability, preferences, and travel time between lessons.",
      icon: Calendar
    },
    {
      step: "4",
      title: "Offers Smart Slots",
      description: "She suggests times that work for both of you, factoring in location.",
      icon: MapPin
    },
    {
      step: "5",
      title: "Confirms & Books",
      description: "Once agreed, she adds the lesson to your calendar and confirms with the learner.",
      icon: CheckCircle
    }
  ];

  const whatDonnaHandles = [
    { icon: Calendar, title: "New Lesson Bookings", description: "First-time and returning learner requests" },
    { icon: Clock, title: "Rescheduling Requests", description: "Moving lessons to better times" },
    { icon: XCircle, title: "Cancellations", description: "Processing cancellations gracefully" },
    { icon: HelpCircle, title: "FAQ Answers", description: "Pricing, areas, availability queries" },
    { icon: Shield, title: "Polite Declines", description: "Unsuitable requests handled professionally" }
  ];

  const whyWhatsApp = [
    { icon: Phone, title: "No App Downloads", description: "Learners already use WhatsApp daily — no friction" },
    { icon: Users, title: "Familiar Interface", description: "Trusted, comfortable, no learning curve" },
    { icon: CheckCircle, title: "Works Everywhere", description: "Any phone, any learner, any time" }
  ];

  const donnaPersonality = [
    {
      scenario: "Greeting a new learner",
      response: "Hi! 👋 I'm Donna, Sarah's assistant. I help manage her diary so she can focus on teaching. How can I help you today?"
    },
    {
      scenario: "When slots don't work",
      response: "I understand those times don't suit. Let me check a few more options for you... Would Thursday at 2pm or Friday at 10am work better?"
    },
    {
      scenario: "Handling a cancellation",
      response: "No problem at all — life happens! I've cancelled your lesson for Tuesday. Would you like me to find you another slot this week?"
    },
    {
      scenario: "When she needs to hand off",
      response: "That's a great question, but I want to make sure you get the best answer. I've passed this to Sarah and she'll get back to you shortly!"
    },
    {
      scenario: "Confirming a booking",
      response: "Brilliant! ✅ You're booked in for Thursday 14th at 3pm. I've sent the details to your phone. See you then!"
    }
  ];

  const faqs = [
    {
      question: "What if a learner asks something Donna can't handle?",
      answer: "Donna is designed to recognize her limits. For complex questions, sensitive topics, or anything outside her scope, she'll politely let the learner know she's passing the message to you — and you'll receive it instantly."
    },
    {
      question: "Can I customize what Donna says?",
      answer: "Yes! During your onboarding call, we'll set up Donna's tone and responses to match your style. You can also update her responses anytime through your dashboard."
    },
    {
      question: "Do learners know they're talking to AI?",
      answer: "Donna introduces herself as your assistant. Most learners appreciate the instant responses and don't mind — many prefer it to waiting for a callback. You can choose how transparent you want to be."
    },
    {
      question: "What happens outside my working hours?",
      answer: "Donna works 24/7! She'll handle queries, offer your next available slots, and make sure no message goes unanswered — even at 11pm on a Sunday."
    },
    {
      question: "Can Donna handle multiple learners at once?",
      answer: "Absolutely. Unlike you (who can only answer one call at a time), Donna can manage dozens of conversations simultaneously — no learner waits in a queue."
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
            <div className="w-16 h-16 bg-primary-foreground/10 rounded-2xl flex items-center justify-center mx-auto">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your AI Receptionist
              <br />
              <span className="text-accent">That Never Sleeps</span>
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              24/7 availability. Natural conversations. No app downloads for learners. 
              Donna handles your WhatsApp bookings while you focus on teaching.
            </p>
            <div className="flex flex-row gap-2 sm:gap-3 justify-center pt-4">
              <Link to="/book-demo">
                <Button variant="accent" size="lg" className="text-xs sm:text-base px-4 sm:px-8 py-2 sm:py-3">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How Donna Books Lessons */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How Donna Books Lessons
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From first message to confirmed booking — all automated
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto"
            {...staggerContainer}
          >
            <div className="relative">
              {/* Connection line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
              
              {bookingFlow.map((item, index) => (
                <div key={index}>
                  <motion.div
                    className={`relative flex items-center gap-6 ${
                      index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    }`}
                    {...staggerItem}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                      <div className={`bg-card border border-border rounded-xl p-3 sm:p-6 ${
                        index % 2 === 0 ? 'lg:mr-8' : 'lg:ml-8'
                      }`}>
                        <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                        <p className="text-xs sm:text-base text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    
                    <div className="hidden lg:flex w-12 h-12 bg-primary text-primary-foreground rounded-full items-center justify-center font-bold text-lg z-10">
                      {item.step}
                    </div>
                    
                    <div className="flex-1 hidden lg:block" />
                  </motion.div>
                  
                  {/* Arrow between cards - mobile/tablet only */}
                  {index < bookingFlow.length - 1 && (
                    <div className="flex justify-center py-2 lg:hidden">
                      <svg 
                        className="w-5 h-5 text-muted-foreground/40" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor" 
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Donna Handles */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Donna Handles
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything a great receptionist does — instantly, 24/7
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 max-w-5xl mx-auto items-start"
            {...staggerContainer}
          >
            {whatDonnaHandles.map((item, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-2.5 sm:p-6 text-center"
                {...staggerItem}
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <item.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-xs sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WhatsApp Mockup */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              A Real Conversation
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how natural Donna sounds when booking a lesson
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-md mx-auto"
            {...fadeInUp}
          >
            <div className="bg-[#ECE5DD] rounded-2xl overflow-hidden shadow-xl">
              {/* WhatsApp Header */}
              <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">🚗</span>
                </div>
                <div>
                  <p className="font-semibold">Sarah's Driving School</p>
                  <p className="text-xs text-white/70">Donna • Online</p>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="p-4 space-y-3">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-800">Hi, I'd like to book a driving lesson please</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:32</p>
                  </div>
                </div>
                
                {/* Donna response */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">Hi! 👋 I'm Donna, Sarah's assistant. Lovely to hear from you!</p>
                    <p className="text-sm text-gray-800 mt-2">I'd be happy to book you in. Are you a new learner or have you driven with Sarah before?</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:32</p>
                  </div>
                </div>
                
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-800">New learner! I'm in the BS5 area</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:33</p>
                  </div>
                </div>
                
                {/* Donna response */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">Perfect! Sarah covers BS5 📍</p>
                    <p className="text-sm text-gray-800 mt-2">I have availability this week:</p>
                    <p className="text-sm text-gray-800 mt-1">• Thursday 14th at 2pm</p>
                    <p className="text-sm text-gray-800">• Friday 15th at 10am</p>
                    <p className="text-sm text-gray-800 mt-2">Would either of those work for you?</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:33</p>
                  </div>
                </div>
                
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-[#DCF8C6] rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                    <p className="text-sm text-gray-800">Thursday at 2 works great!</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:34</p>
                  </div>
                </div>
                
                {/* Donna confirmation */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg rounded-tl-none px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-800">Brilliant! ✅ You're booked in for Thursday 14th at 2pm.</p>
                    <p className="text-sm text-gray-800 mt-2">Sarah will pick you up from your home address. Please share it when you're ready!</p>
                    <p className="text-sm text-gray-800 mt-2">Looking forward to your first lesson! 🚗</p>
                    <p className="text-[10px] text-gray-500 text-right mt-1">10:34</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Donna's Personality */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-7 h-7 text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Donna Responds Like a Real Assistant
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Polite, helpful, and always professional — learners feel looked after
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 lg:gap-6 max-w-4xl mx-auto items-start"
            {...staggerContainer}
          >
            {donnaPersonality.map((item, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-4 sm:p-6"
                {...staggerItem}
              >
                <p className="text-sm font-medium text-primary mb-2 sm:mb-3">{item.scenario}</p>
                <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                  <p className="text-sm sm:text-base text-foreground italic">"{item.response}"</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why WhatsApp */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why WhatsApp?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Meet your learners where they already are
            </p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 lg:gap-6 max-w-4xl mx-auto items-start"
            {...staggerContainer}
          >
            {whyWhatsApp.map((item, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-5 sm:p-6 text-center"
                {...staggerItem}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#25D366]/10 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Smart Handoff */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto"
            {...fadeInUp}
          >
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-border rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Smart Handoff — You're Always in Control
              </h2>
              <p className="text-muted-foreground text-lg mb-6 max-w-xl mx-auto">
                Complex or sensitive requests get forwarded to you instantly. Donna knows when to step back and let you take over.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Complaints forwarded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Unusual requests flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>You reply when needed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>
          
          <motion.div 
            className="max-w-3xl mx-auto space-y-4"
            {...staggerContainer}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-card border border-border rounded-xl p-6"
                {...staggerItem}
              >
                <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            {...fadeInUp}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Ready to Let Donna Handle Your Bookings?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Book a demo and we'll set everything up for you on a free onboarding call.
            </p>
            <Link to="/book-demo">
              <Button variant="default" size="lg" className="text-base px-8 py-3">
                Book Your Demo
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AIWhatsAppBooking;
