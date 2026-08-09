import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const ThankYou = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center animate-scale-in">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Thank You for Booking Your Demo!
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-5 sm:mb-6 px-2">
            We've received your details and will be in touch within 24 hours.
          </p>

          {/* Supporting Paragraph */}
          <div className="bg-card rounded-xl shadow-card p-5 sm:p-7 lg:p-8 mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-foreground leading-relaxed">
              While you wait, explore how Donna Drive saves instructors hours every week — automating messages, schedules, and routes so you can focus on teaching.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 px-2">
            <Link to="/" className="w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Link to="/#how-donna-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full">
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Final Note */}
          <p className="text-xs sm:text-sm text-muted-foreground px-2">
            If you don't hear from us soon, please email{" "}
            <a 
              href="mailto:info@smarterwayy.co.uk" 
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              info@smarterwayy.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
