import { motion } from "framer-motion";
import {
    ArrowRight,
    Calendar,
    MessageCircle,
    ShieldCheck,
    Zap,
    Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Typewriter } from "react-simple-typewriter";
import donnaMascot from "@/assets/donna-drive-mascot-hero.png";

const features = [
    {
        icon: Zap,
        text: "Setup in 5 mins",
    },
    {
        icon: Calendar,
        text: "Google Calendar Sync",
    },
    {
        icon: MessageCircle,
        text: "WhatsApp Native",
    },
    {
        icon: ShieldCheck,
        text: "30-Day Free Trial",
    },
];

const FinalCTA = () => {
    return (
        <section className="relative overflow-hidden bg-background py-32">
            {/* Background Glow */}
            <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

            <div className="relative mx-auto max-w-6xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative overflow-visible rounded-[48px] border border-border/60 bg-white shadow-[0_30px_100px_rgba(0,0,0,.08)]"
                >
                    {/* Hero Content */}

                    <div className="px-8 pt-20 pb-14 text-center md:px-20">
                        <span className="inline-flex rounded-full bg-primary/10 px-5 py-2 text-sm font-semibold text-primary">

                            One Final Question...

                        </span>

                        <h2 className="mt-8 text-5xl lg:text-7xl font-black">

                            Are you ready to

                            <br />

                            <span className="text-primary">

                                <Typewriter

                                    words={[

                                        "get your evenings back?",

                                        "stop chasing learners?",

                                        "grow your driving school?",

                                        "let Donna handle the admin?",

                                    ]}

                                    loop={0}

                                    cursor

                                    cursorStyle="|"

                                    typeSpeed={60}

                                    deleteSpeed={35}

                                    delaySpeed={2000}

                                />

                            </span>

                        </h2>

                        {/* Buttons */}

                        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link to="/book-demo">
                                <Button
                                    size="lg"
                                    className="h-14 rounded-xl px-10 text-base"
                                >
                                    Book Your Live Demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 rounded-xl px-10 text-base"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Watch Donna Work
                            </Button>
                        </div>
                    </div>

                    {/* Feature Strip */}

                    <div className="border-y bg-muted/30">
                        <div className="grid grid-cols-2 lg:grid-cols-4">
                            {features.map((feature) => {
                                const Icon = feature.icon;

                                return (
                                    <div
                                        key={feature.text}
                                        className="flex items-center justify-center gap-3 border-r border-border px-6 py-7 last:border-r-0"
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>

                                        <span className="font-medium text-foreground">
                                            {feature.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Mascot */}

                    <motion.div
                        className="relative flex justify-center -mt-4"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <img
                            src={donnaMascot}
                            alt="Donna"
                            className="w-[160px] lg:w-[260px] drop-shadow-[0_40px_80px_rgba(0,0,0,.18)]"
                        />
                    </motion.div>

                    {/* Bottom Text */}

                    <div className="pb-12 text-center">
                        <p className="text-muted-foreground">
                            Join instructors who are spending less time on admin
                            <br />
                            and more time doing what they love.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;