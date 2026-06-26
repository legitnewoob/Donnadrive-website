import { motion } from "framer-motion";

interface Props {
  delay: number;
}

const TypingIndicator = ({ delay }: Props) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{
        delay,
      }}
      className="flex justify-start"
    >
      <div className="rounded-2xl rounded-bl-md bg-white px-5 py-4 shadow-md">
        <div className="flex gap-2">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-2.5 w-2.5 rounded-full bg-gray-400"
              animate={{
                opacity: [0.3, 1, 0.3],
                y: [0, -2, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1,
                delay: dot * 0.18,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;