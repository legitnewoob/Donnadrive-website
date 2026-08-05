import { Link } from "react-router-dom";
import {
  MessageCircle,
  Calendar,
  Route,
  LayoutDashboard,
  GraduationCap,
  Building2,
  ArrowRight,
} from "lucide-react";

interface FeatureCard {
  slug: string;
  icon: typeof MessageCircle;
  title: string;
  teaser: string;
  detail: string;
  ctaLabel: string;
  href: string;
  external?: boolean; // same-page anchor vs. a route
}

const cards: FeatureCard[] = [
  {
    slug: "whatsapp",
    icon: MessageCircle,
    title: "AI WhatsApp",
    teaser: "Replies instantly, books lessons 24/7.",
    detail:
      "Donna answers learner questions the moment they land, books the slot and confirms it — all inside the WhatsApp chat they already have open.",
    ctaLabel: "See more",
    href: "/ai-whatsapp-booking",
  },
  {
    slug: "calendar",
    icon: Calendar,
    title: "Smart Calendar",
    teaser: "No double-bookings, ever.",
    detail:
      "Every lesson syncs straight to your Google Calendar. Donna checks real availability before she books, so your diary never clashes.",
    ctaLabel: "See more",
    href: "/smart-calendar",
  },
  {
    slug: "routes",
    icon: Route,
    title: "Optimised Routes",
    teaser: "Less driving, more teaching.",
    detail:
      "Donna orders your day's lessons by location automatically, cutting dead time between pickups so you teach more and drive less.",
    ctaLabel: "See more",
    href: "/route-optimization",
  },
  {
    slug: "portal",
    icon: LayoutDashboard,
    title: "Student Portal",
    teaser: "Learners see everything, ask nothing.",
    detail:
      "Bookings, payments and lesson progress live in one place your learners can check themselves — fewer \"when's my next lesson?\" texts.",
    ctaLabel: "See more",
    href: "/portal",
  },
  {
    slug: "pdi",
    icon: GraduationCap,
    title: "Free for PDIs",
    teaser: "Training? Donna's free until you qualify.",
    detail:
      "Unlimited WhatsApp conversations, Google Calendar sync and lesson booking — free for every Potential Driving Instructor, no card required.",
    ctaLabel: "See pricing",
    href: "/#pricing",
    external: true,
  },
  {
    slug: "schools",
    icon: Building2,
    title: "For Driving Schools",
    teaser: "One Donna, every instructor.",
    detail:
      "Team dashboard, instructor management and custom integrations — built for schools running more than one instructor on the road.",
    ctaLabel: "See pricing",
    href: "/#pricing",
    external: true,
  },
];

const CardContent = ({ card, ariaHidden }: { card: FeatureCard; ariaHidden?: boolean }) => {
  const Icon = card.icon;

  const inner = (
    <>
      <div className="w-14 h-14 rounded-2xl bg-white/15 group-hover:bg-primary/10 flex items-center justify-center mb-5 transition-colors duration-300">
        <Icon className="w-7 h-7 text-white group-hover:text-primary transition-colors duration-300" />
      </div>

      <h3 className="font-bold text-lg text-white group-hover:text-gray-900 transition-colors duration-300">
        {card.title}
      </h3>

      <p className="mt-2 text-sm text-white/75 group-hover:text-gray-500 leading-6 transition-colors duration-300">
        {card.teaser}
      </p>

      {/* Hover preview: grid-rows 0fr -> 1fr gives a smooth height
          animation without measuring anything in JS. */}
      <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
        <div className="overflow-hidden">
          <p className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 leading-6">
            {card.detail}
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
            {card.ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "marquee-card group shrink-0 w-[280px] rounded-2xl bg-white/20 md:bg-white/10 md:backdrop-blur-xl border border-white/15 p-6 hover:bg-white/95 hover:border-white/60 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative hover:z-20 block";

  if (card.external) {
    return (
      <a
        href={card.href}
        className={className}
        aria-hidden={ariaHidden}
        tabIndex={ariaHidden ? -1 : undefined}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={card.href}
      className={className}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
    >
      {inner}
    </Link>
  );
};

const FeatureMarquee = () => {
  return (
    <div className="overflow-hidden py-3">
      <div className="marquee-track flex gap-5 w-max animate-marquee pl-6">
        {cards.map((card) => (
          <CardContent key={card.slug} card={card} />
        ))}
        {cards.map((card) => (
          <CardContent key={`${card.slug}-dup`} card={card} ariaHidden />
        ))}
      </div>
    </div>
  );
};

export default FeatureMarquee;
