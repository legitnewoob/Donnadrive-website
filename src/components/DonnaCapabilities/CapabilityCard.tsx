import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  size: "small" | "large" | "wide";
  index: number;
}

const CapabilityCard = ({
  icon: Icon,
  title,
  description,
  size,
  index,
}: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: index * 0.08,
        duration: 0.5,
      }}
      whileHover={{
        y: -8,
      }}
      className={`
        group
        rounded-3xl
        border
        border-border
        bg-card
        p-8
        shadow-sm
        hover:shadow-2xl
        transition-all
        duration-300

        ${
          size === "large"
            ? "lg:col-span-2 lg:row-span-2"
            : size === "wide"
            ? "lg:col-span-2"
            : ""
        }
      `}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110 group-hover:rotate-6" />
      </div>

      <h3 className="mt-6 text-2xl font-bold">
        {title}
      </h3>

      <p className="mt-4 leading-7 text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
        Learn more
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
};

export default CapabilityCard;