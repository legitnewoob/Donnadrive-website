import {
  MessageCircle,
  Calendar,
  Route,
  Bell,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";

export const capabilities = [
  {
    icon: MessageCircle,
    title: "WhatsApp Booking",
    description:
      "Donna chats naturally with learners, answers questions and books lessons instantly.",
    size: "large",
  },
  {
    icon: Calendar,
    title: "Google Calendar",
    description:
      "Every booking automatically appears in your calendar with no manual work.",
    size: "small",
  },
  {
    icon: Route,
    title: "Smart Routes",
    description:
      "Lessons are grouped together to reduce travel time and fuel costs.",
    size: "small",
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description:
      "Donna reminds learners before every lesson to reduce no-shows.",
    size: "small",
  },
  {
    icon: LayoutDashboard,
    title: "Student Portal",
    description:
      "Track payments, lesson history, progress and upcoming bookings in one place.",
    size: "wide",
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    description:
      "See bookings, cancellations and learner activity at a glance.",
    size: "small",
  },
];