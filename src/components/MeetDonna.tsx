import { motion } from "framer-motion";

const donnaCharacter = "/donna-mascot.jpg?v=2";

const MeetDonna = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Donna Image */}
            <motion.div
              className="flex justify-center sm:justify-start order-1"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="relative">
                {/* Decorative background circle */}
                <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl sm:blur-2xl" />
                
                {/* Image container with elegant styling */}
                <motion.div
                  className="relative"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={donnaCharacter}
                    alt="Donna - Your AI Booking Assistant"
                    className="w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 object-cover rounded-2xl sm:rounded-[2rem] shadow-xl ring-2 sm:ring-4 ring-white/50"
                  />
                </motion.div>
              </div>
            </motion.div>

            {/* Text Content */}
            <motion.div
              className="space-y-3 sm:space-y-6 text-center sm:text-left order-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="space-y-2 sm:space-y-3">
                <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
                  Your AI Assistant
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground">
                  Meet Donna
                </h2>
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto sm:mx-0">
                Donna isn't just software — she's your tireless assistant who works around the clock.
              </p>

              <ul className="space-y-1.5 sm:space-y-3 text-left max-w-lg mx-auto sm:mx-0">
                {[
                  "Responds in seconds",
                  "Understands your availability",
                  "Never double-books",
                  "Works 24/7"
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-start gap-1.5 sm:gap-3 justify-center sm:justify-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm sm:text-base text-muted-foreground">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetDonna;
