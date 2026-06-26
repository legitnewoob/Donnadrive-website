import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface Props {
  icon: any;
  title: string;
  description: string;
  bullets: string[];
}

export default function CapabilityCard({
  icon: Icon,
  title,
  description,
  bullets,
}: Props) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
      }}
      transition={{
        duration: .25,
      }}
      className="
      group
      rounded-3xl
      border
      bg-white
      p-8
      shadow-sm
      hover:shadow-2xl
      hover:border-primary/40
      transition-all
      duration-300
      "
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white mb-8 group-hover:rotate-6 transition-transform">

        <Icon size={30} />

      </div>

      <h3 className="text-2xl font-bold">

        {title}

      </h3>

      <p className="mt-4 text-muted-foreground leading-7">

        {description}

      </p>

      <div className="mt-8 space-y-3">

        {bullets.map((bullet) => (
          <div
            key={bullet}
            className="flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />

            <span>{bullet}</span>
          </div>
        ))}

      </div>

      <div className="mt-8 flex items-center gap-2 text-primary font-semibold">

        Learn More

        <ArrowRight
          size={18}
          className="group-hover:translate-x-1 transition-transform"
        />

      </div>

    </motion.div>
  );
}