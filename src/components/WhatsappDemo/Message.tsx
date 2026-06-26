import { motion } from "framer-motion";

interface MessageProps {
  text: string;
  side: "left" | "right";
  delay: number;
}

const Message = ({ text, side, delay }: MessageProps) => {
  const isRight = side === "right";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
        scale: 0.95,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      viewport={{ once: true }}
      transition={{
        delay,
        duration: 0.4,
      }}
      className={`flex ${isRight ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[82%] rounded-2xl px-4 py-3 shadow-md ${
          isRight
            ? "bg-[#F86C4F] text-white rounded-br-md"
            : "bg-white text-gray-800 rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-6">{text}</p>

        <div
          className={`mt-2 text-[10px] ${
            isRight ? "text-white/70" : "text-gray-400"
          }`}
        >
          09:41
        </div>
      </div>
    </motion.div>
  );
};

export default Message;