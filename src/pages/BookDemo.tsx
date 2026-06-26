import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const HEAR_ABOUT_OPTIONS = [
  "Google Search",
  "Social Media",
  "Word of Mouth",
  "Driving Instructor Community",
  "Email Newsletter",
  "Other",
];
const BookDemo = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    contactNumber: "",
    locationPostcode: "",
    hearAboutUs: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.businessName.trim()) {
      newErrors.businessName =
        "Business name is required.";
    }
    if (!form.contactNumber.trim()) {
      newErrors.contactNumber =
        "Contact number is required.";
    }
    return newErrors;
  };
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with backend API
      console.log("Form Submitted:", form);
      await new Promise((r) =>
        setTimeout(r, 1000)
      );
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Back */}
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Get 1 Month Free Before Launch
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-5">
              Book a Demo with Donna Drive
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover how Donna Drive can automate
              learner communication, save hours of
              admin every week, and help your driving
              school run more efficiently.
            </p>
          </div>
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            <div className="bg-card rounded-2xl shadow-card p-6 text-center">
              <Clock3 className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">
                Save 5+ Hours Weekly
              </h3>
              <p className="text-sm text-muted-foreground">
                Spend less time on admin and more time
                teaching learners.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-card p-6 text-center">
              <MessageSquare className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">
                Automated Communication
              </h3>
              <p className="text-sm text-muted-foreground">
                Let Donna handle reminders, messages,
                and learner updates.
              </p>
            </div>
            <div className="bg-card rounded-2xl shadow-card p-6 text-center">
              <Gift className="w-8 h-8 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">
                Early Access Benefits
              </h3>
              <p className="text-sm text-muted-foreground">
                Join before launch and receive one
                month free.
              </p>
            </div>
          </div>
          {/* Form */}
          <div className="bg-card rounded-3xl shadow-elegant p-6 md:p-10 mb-10">
            {submitted ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">
                  🎉 Demo Request Received!
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto mb-8">
                  Thanks for reaching out. We'll
                  contact you within 24 hours to
                  schedule your personalised Donna
                  Drive walkthrough.
                </p>
                <div className="max-w-md mx-auto bg-primary/5 rounded-2xl p-6 text-left">
                  <h3 className="font-semibold mb-4">
                    Your Early Access Benefits
                  </h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li>✅ 1 Month Free Access</li>
                    <li>✅ Priority Onboarding</li>
                    <li>✅ Early Feature Access</li>
                    <li>✅ Personal Setup Assistance</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    Schedule Your Personal Demo
                  </h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll
                    be in touch shortly.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <FormField
                    label="Full Name"
                    required
                    error={errors.fullName}
                  >
                    <input
                      type="text"
                      name="fullName"
                      placeholder="John Smith"
                      value={form.fullName}
                      onChange={handleChange}
                      className={fieldClass(
                        !!errors.fullName
                      )}
                    />
                  </FormField>
                  <FormField
                    label="Email"
                    required
                    error={errors.email}
                  >
                    <input
                      type="email"
                      name="email"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={handleChange}
                      className={fieldClass(
                        !!errors.email
                      )}
                    />
                  </FormField>
                  <FormField
                    label="Business / Driving School Name"
                    required
                    error={errors.businessName}
                  >
                    <input
                      type="text"
                      name="businessName"
                      placeholder="ABC Driving School"
                      value={form.businessName}
                      onChange={handleChange}
                      className={fieldClass(
                        !!errors.businessName
                      )}
                    />
                  </FormField>
                  <FormField
                    label="Contact Number"
                    required
                    error={errors.contactNumber}
                  >
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="+44 7123 456789"
                      value={form.contactNumber}
                      onChange={handleChange}
                      className={fieldClass(
                        !!errors.contactNumber
                      )}
                    />
                  </FormField>
                  <FormField
                    label="Location / Postcode"
                  >
                    <input
                      type="text"
                      name="locationPostcode"
                      placeholder="SW1A 1AA"
                      value={form.locationPostcode}
                      onChange={handleChange}
                      className={fieldClass(false)}
                    />
                  </FormField>
                  <FormField
                    label="How did you hear about us?"
                  >
                    <select
                      name="hearAboutUs"
                      value={form.hearAboutUs}
                      onChange={handleChange}
                      className={fieldClass(false)}
                    >
                      <option value="">
                        Choose an option
                      </option>
                      {HEAR_ABOUT_OPTIONS.map(
                        (option) => (
                          <option
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        )
                      )}
                    </select>
                  </FormField>
                </div>
                <div className="mt-5">
                  <FormField
                    label="Message / Notes"
                  >
                    <textarea
                      rows={5}
                      name="message"
                      placeholder="Tell us about your driving school and what you'd like to see during the demo..."
                      value={form.message}
                      onChange={handleChange}
                      className={`${fieldClass(
                        false
                      )} resize-none`}
                    />
                  </FormField>
                </div>
                <p className="text-xs text-muted-foreground mt-5">
                  By submitting this form, you agree
                  to be contacted regarding your demo
                  request.
                </p>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full mt-6 h-12 text-base font-semibold"
                >
                  {loading
                    ? "Booking Demo..."
                    : "Book My Demo"}
                </Button>
              </>
            )}
          </div>
          {/* What Happens Next */}
          <div className="bg-card rounded-3xl shadow-card p-8 mb-10">
            <h3 className="text-2xl font-bold text-center mb-8">
              What Happens Next?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Step
                number="1"
                title="We Contact You"
                text="We'll reach out within 24 hours to learn about your driving school."
              />
              <Step
                number="2"
                title="Live Walkthrough"
                text="See Donna Drive in action and ask questions tailored to your business."
              />
              <Step
                number="3"
                title="Get Early Access"
                text="Join before launch and receive your free month and priority onboarding."
              />
            </div>
          </div>
          {/* Testimonials */}
          <div className="bg-card rounded-3xl shadow-card p-8 mb-10">
            <h3 className="text-2xl font-bold text-center mb-8">
              Trusted by Driving Instructors
            </h3>
            <div className="grid md:grid-cols-2 gap-5">
              <Testimonial
                quote="Donna Drive feels like having a personal assistant — my schedule runs itself!"
                author="Sarah M."
              />
              <Testimonial
                quote="It's freed up hours every week — now I can focus purely on my learners."
                author="James T."
              />
            </div>
          </div>
          {/* Footer */}
          <div className="bg-primary/5 rounded-2xl p-6 text-center">
            <p className="text-foreground mb-2">
              Questions before booking?
            </p>
            <p className="text-sm text-muted-foreground">
              Email us at{" "}
              <a
                href="mailto:info@smarterwayy.co.uk"
                className="text-primary underline"
              >
                info@smarterwayy.co.uk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
const fieldClass = (
  hasError: boolean
) =>
  `w-full rounded-xl border ${
    hasError
      ? "border-destructive"
      : "border-border"
  } bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`;
const FormField = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-semibold mb-2">
      {label}
      {required && (
        <span className="text-destructive ml-1">
          *
        </span>
      )}
    </label>
    {children}
    {error && (
      <p className="text-xs text-destructive mt-2">
        {error}
      </p>
    )}
  </div>
);
const Step = ({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) => (
  <div className="text-center">
    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mx-auto mb-4">
      {number}
    </div>
    <h4 className="font-semibold mb-2">
      {title}
    </h4>
    <p className="text-sm text-muted-foreground">
      {text}
    </p>
  </div>
);
const Testimonial = ({
  quote,
  author,
}: {
  quote: string;
  author: string;
}) => (
  <div className="bg-primary/5 rounded-2xl p-6">
    <p className="italic mb-4">
      "{quote}"
    </p>
    <p className="text-sm text-muted-foreground">
      — {author}, Driving Instructor
    </p>
  </div>
);
export default BookDemo;