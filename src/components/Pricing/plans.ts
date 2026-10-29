import { GraduationCap, User, Building2 } from "lucide-react";

export const plans = [
  {
    slug: "pdi",
    ctaRoute: "/get-started/pdi",

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
    slug: "adi",
    ctaRoute: "/get-started/adi",

    icon: User,
    title: "ADI",
    subtitle: "For qualified instructors",

    price: "£10",
    period: "/month",

    popular: true,

    button: "Start Free Trial",

    features: [
      "Everything in PDI",
      "Instructor Portal",
      "Smart Routes",
      "Automatic reminders",
      "Priority support",
    ],
  },

  {
    slug: "driving-school",
    ctaRoute: "/get-started/driving-school",

    icon: Building2,
    title: "Driving Schools",
    subtitle: "Up to 3 instructors",
    price: "£20",
    period: "/month",
    popular: false,
    button: "Get started",
    features: [
      "Everything in ADI, for each instructor",
      "3 instructors included, then £10/month each",
      "Team page to invite and manage instructors",
      "See every instructor's learners and lessons",
      "One bill for the whole school",
    ],
  },
];

