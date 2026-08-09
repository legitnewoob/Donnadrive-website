import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4">
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Your Evenings Back?
          </h2>
          <p className="text-primary-foreground/90 text-base sm:text-lg mb-8">
            Book a demo and see how Donna can handle your bookings.
          </p>
          
          <Link to="/book-demo">
            <Button variant="accent" size="lg" className="text-base px-8 py-3 mb-8">
              Get Started
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 text-primary-foreground/70 text-sm mb-8">
            <Mail className="w-4 h-4" />
            <a href="mailto:info@smarterwayy.co.uk" className="hover:text-primary-foreground transition-colors">
              info@smarterwayy.co.uk
            </a>
          </div>
        </motion.div>

        <div className="text-center text-primary-foreground/60 flex items-center justify-center gap-4 text-sm">
          <Link to="/privacy-policy" className="underline hover:text-primary-foreground transition-colors">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link to="/terms-of-service" className="underline hover:text-primary-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Contact;
