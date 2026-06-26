import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface BenefitPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

const BenefitPanel = ({
  icon: Icon,
  title,
  description,
  index,
}: BenefitPanelProps) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
      }}
      whileHover={{
        y: -6,
      }}
      className="
        group
        rounded-[32px]
        border
        border-border
        bg-card
        p-10
        transition-all
        duration-300
        hover:border-primary/30
        hover:shadow-2xl
      "
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-8">

        <div className="
          flex
          h-20
          w-20
          items-center
          justify-center
          rounded-3xl
          bg-gradient-to-br
          from-primary
          to-orange-400
          text-white
          transition-transform
          duration-300
          group-hover:rotate-6
          group-hover:scale-110
        ">
          <Icon size={38} />
        </div>

        <div className="flex-1">

          <h3 className="text-3xl font-black tracking-tight">

            {title}

          </h3>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">

            {description}

          </p>

        </div>

      </div>
    </motion.div>
  );
};

export default BenefitPanel;