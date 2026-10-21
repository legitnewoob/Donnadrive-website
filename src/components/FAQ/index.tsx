import { useDisplayPlans, isFreePlan } from "@/lib/pricing";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import RoundaboutMapBackground from "@/components/RoundaboutMapBackground";

const faqs = [
  {
    question: "Can Donna really book lessons automatically?",
    answer:
      "Yes. Donna chats with learners on WhatsApp, checks your availability, finds the best lesson slot, books it, and updates your Google Calendar automatically.",
  },
  {
    question: "Does Donna work with Google Calendar?",
    answer:
      "Absolutely. Donna syncs directly with your Google Calendar to avoid clashes, respect your working hours, and instantly add confirmed lessons.",
  },
  {
    question: "What happens if a learner cancels?",
    answer:
      "Donna updates your calendar immediately and can help fill the newly available slot by handling new enquiries without any manual work.",
  },
  {
    question: "Can I customise lesson lengths and working hours?",
    answer:
      "Yes. Set your own lesson durations, breaks, working hours, holidays and preferred schedule. Donna follows your rules automatically.",
  },
  {
    question: "Do learners need to install anything?",
    answer:
      "No. Everything happens through WhatsApp, so your learners already know how to use it.",
  },
];

const FAQ = () => {
  // Trial length comes from the admin panel, so the answer always matches pricing
  const { plans } = useDisplayPlans();
  const paid = plans.filter((p) => !isFreePlan(p));
  const withTrial = paid.filter((p) => p.trialDays > 0);
  const free = plans.filter(isFreePlan);
  const names = (list: typeof plans) => list.map((p) => p.title).join(list.length > 2 ? ", " : " and ").replace(/, ([^,]*)$/, " and $1");
  const trials = [...new Set(withTrial.map((p) => p.trialDays))];
  const allFaqs = [
    ...faqs,
    {
      question: "Is there a free trial?",
      answer:
        (withTrial.length
          ? `Yes. ${withTrial.length === paid.length ? "Every paid plan starts" : `The ${names(withTrial)} plan${withTrial.length > 1 ? "s start" : " starts"}`} with ${
              trials.length === 1 ? `a ${trials[0]}-day free trial` : "a free trial"
            }. You add a card at sign-up but aren't charged until the trial ends, and you can cancel any time before then.`
          : "Paid plans are billed monthly and you can cancel any time.") +
        (free.length ? ` The ${names(free)} plan${free.length > 1 ? "s are" : " is"} free.` : ""),
    },
  ];
  return (
    <section
      id="faq"
      className="relative overflow-hidden py-12 md:py-32 bg-background"
    >
      <RoundaboutMapBackground />

      <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-primary/5 blur-2xl md:blur-3xl" />

      <div className="mx-auto max-w-5xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            Questions?
          </span>

          <h2 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know before letting Donna
            take care of your bookings.
          </p>
        </motion.div>

        <motion.div
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Accordion
            type="single"
            collapsible
            className="space-y-4"
          >
            {allFaqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: index * 0.08,
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="
                    rounded-3xl
                    border
                    bg-white
                    px-8
                    shadow-sm
                    transition-all
                    duration-300
                    hover:shadow-lg
                  "
                >
                  <AccordionTrigger className="py-7 text-left text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>

                  <AccordionContent className="pb-7 pr-8 text-base leading-8 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>

                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

      </div>
    </section>
  );
};

export default FAQ;
