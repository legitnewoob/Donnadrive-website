import { GraduationCap, User, Building2 } from "lucide-react";

export const plans = [
  {
    icon: GraduationCap,
    title: "PDI",
    subtitle: "Perfect while you're training",
    price: "Free",
    period: "",
    popular: false,
    button: "Get Started",
    features: [
      "Unlimited WhatsApp conversations",
      "Google Calendar sync",
      "Lesson booking",
      "Until you qualify",
    ],
  },
  {
    icon: User,
    title: "ADI",
    subtitle: "For qualified instructors",
    price: "£10",
    period: "/month",
    popular: true,
    button: "Start Free Trial",
    features: [
      "Everything in PDI",
      "Student Portal",
      "Smart Routes",
      "Automatic reminders",
      "Priority support",
    ],
  },
  {
    icon: Building2,
    title: "Driving Schools",
    subtitle: "Multiple instructors",
    price: "Custom",
    period: "",
    popular: false,
    button: "Contact Sales",
    features: [
      "Everything in ADI",
      "Team dashboard",
      "Instructor management",
      "Custom integrations",
    ],
  },
];