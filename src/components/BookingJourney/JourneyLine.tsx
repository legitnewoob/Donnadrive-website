import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface JourneyLineProps {
  delay?: number;
}

const JourneyLine = ({ delay = 0 }: JourneyLineProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      whileInView={{ opacity: 1, scaleX: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        delay,
      }}
      className="hidden lg:flex items-center justify-center origin-left"
    >
      <ArrowRight className="h-7 w-7 text-primary/60" />
    </motion.div>
  );
};

export default JourneyLine;