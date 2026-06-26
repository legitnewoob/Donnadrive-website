import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, GraduationCap, Users, Building2 } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      icon: GraduationCap,
      title: "ADIs",
      price: "£10",
      period: "/month",
      features: [
        "AI WhatsApp booking assistant",
        "Smart calendar integration",
        "Route optimization",
        "Automatic lesson reminders"
      ],
      ctaText: "Start Free Trial",
      highlighted: true
    },
    {
      icon: Users,
      title: "PDIs",
      price: "Free",
      period: "",
      features: [
        "Everything in ADI plan",
        "Free until qualified",
        "Priority upgrade path"
      ],
      ctaText: "Get Started",
      highlighted: false
    },
    {
      icon: Building2,
      title: "Schools",
      price: "Custom",
      period: "",
      features: [
        "Multi-instructor dashboard",
        "Team scheduling",
        "Custom integrations"
      ],
      ctaText: "Contact Us",
      highlighted: false
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-subtle" id="pricing">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-10 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Simple Pricing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            30-day free trial. No payment required.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4 lg:gap-6 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.title}
                className={`bg-card rounded-2xl p-5 sm:p-6 shadow-card border ${plan.highlighted ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-card-foreground">{plan.title}</h3>
                  <div className="mt-1 sm:mt-2">
                    <span className="text-2xl sm:text-3xl font-bold text-card-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-card-foreground leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/book-demo" className="block">
                  <Button 
                    variant={plan.highlighted ? "accent" : "outline"} 
                    className="w-full"
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
