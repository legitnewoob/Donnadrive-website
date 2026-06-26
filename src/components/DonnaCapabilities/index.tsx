import { motion } from "framer-motion";

import WhatsAppPreview from "./WhatsAppPreview";
import CalendarPreview from "./CalendarPreview";
import PortalPreview from "./PortalPreview";
import RoutePreview from "./RoutePreview";
import DashboardPreview from "./DashboardPreview";

const DonnaCapabilities = () => {
    return (
        <section
            id="capabilities"
            className="relative overflow-hidden py-32 bg-gradient-to-b from-background via-orange-50/30 to-background"
        >
            {/* Background */}

            <div className="absolute left-0 top-24 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

            <div className="absolute right-0 bottom-0 h-[28rem] w-[28rem] rounded-full bg-orange-300/10 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-6">

                {/* Heading */}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: .6 }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">

                        Everything Donna Can Do

                    </span>

                    <h2 className="mt-6 text-5xl lg:text-6xl font-black tracking-tight">

                        One Assistant.
                        <br />
                        Every Part Of Your Business.

                    </h2>

                    <p className="mt-6 text-lg leading-8 text-muted-foreground">

                        Every booking, every reminder, every learner—
                        Donna keeps everything running automatically.

                    </p>

                </motion.div>

                {/* Grid */}

                <div className="mt-24 grid grid-cols-12 auto-rows-[280px] gap-6">

                    {/* WhatsApp */}
                    <div className="col-span-12 lg:col-span-7 row-span-2">
                        <WhatsAppPreview />
                    </div>

                    {/* Calendar */}
                    <div className="col-span-12 lg:col-span-5 row-span-2">
                        <CalendarPreview />
                    </div>

                    {/* Portal */}
                    <div className="col-span-12 md:col-span-4 row-span-2">
                        <PortalPreview />
                    </div>

                    {/* Route */}
                    <div className="col-span-12 md:col-span-4 row-span-2">
                        <RoutePreview />
                    </div>

                    {/* Dashboard */}
                    <div className="col-span-12 md:col-span-4 row-span-2">
                        <DashboardPreview />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default DonnaCapabilities;