import { motion } from "framer-motion";

import SectionHeading from "./SectionHeading";
import StationCard from "./StationCard";
import { STATIONS } from "./stations";

/**
 * Small screens and reduced-motion: the same five cards, read straight
 * down the page. No road, nothing scrubbed — but the same content, so the
 * fallback isn't a lesser version of the story.
 */
const StaticSteps = () => (
  <div className="mx-auto max-w-lg px-6 py-20 lg:py-24">
    <SectionHeading />

    <div className="mt-12">
      <ol className="space-y-6">
        {STATIONS.map((station, index) => (
          <motion.li
            key={station.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
          >
            <StationCard station={station} showIcon />
          </motion.li>
        ))}
      </ol>
    </div>
  </div>
);

export default StaticSteps;
