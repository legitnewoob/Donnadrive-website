import {
  MessageCircle,
  Calendar,
  Route,
  LayoutDashboard,
  Bell,
  BarChart3,
} from "lucide-react";

export const capabilities = [
  {
    icon: MessageCircle,
    title: "AI WhatsApp Receptionist",
    description:
      "Replies naturally to learners, books lessons and answers common questions automatically.",
    bullets: [
      "Natural conversations",
      "Books lessons",
      "Handles cancellations",
    ],
  },
  {
    icon: Calendar,
    title: "Smart Diary",
    description:
      "Donna keeps your calendar organised and never books over existing lessons.",
    bullets: [
      "Google Calendar",
      "Availability",
      "No clashes",
    ],
  },
  {
    icon: Route,
    title: "Route Optimisation",
    description:
      "Groups nearby lessons together to reduce driving time and fuel costs.",
    bullets: [
      "Less driving",
      "Better planning",
      "More lessons",
    ],
  },
  {
    icon: LayoutDashboard,
    title: "Learner Portal",
    description:
      "Students can view bookings, progress and upcoming lessons.",
    bullets: [
      "Lesson history",
      "Progress tracking",
      "Upcoming lessons",
    ],
  },
  {
    icon: Bell,
    title: "Automatic Reminders",
    description:
      "Donna reminds learners before every lesson automatically.",
    bullets: [
      "Reduce no-shows",
      "WhatsApp reminders",
      "Custom timing",
    ],
  },
  {
    icon: BarChart3,
    title: "Business Insights",
    description:
      "Track bookings, utilisation and instructor performance.",
    bullets: [
      "Revenue",
      "Bookings",
      "Growth",
    ],
  },
];