import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const faqs = [
  {
    question: "I'm not technical. Can I really do this?",
    answer: "If you can use WhatsApp and Gmail, you can do this. Everything is step-by-step, click-by-click. I show you exactly where to click, what to type, and what each button does. My 55-year-old mom could follow this.",
    defaultOpen: true,
  },
  {
    question: "How quickly can I get started?",
    answer: "You get instant access after payment. Most students complete the setup within 2 weeks and start seeing results in their first 30 days. The training is self-paced, so you can go faster if you have more time.",
    defaultOpen: true,
  },
  {
    question: 'Will this work in India / for Indian businesses?',
    answer: "This is BUILT for the Indian market. All examples are from Indian businesses. The lead database includes Indian companies. 1132+ Indian freelancers and agencies are already using this.",
    defaultOpen: true,
  },
  {
    question: "I've tried cold email before. It never works.",
    answer: "Because you didn't have: (1) Intent signals to find people ready to buy, (2) AI personalization that makes every email unique, (3) Proper email infrastructure to avoid spam. This system has all three. That's why it works.",
    defaultOpen: false,
  },
  {
    question: 'How long until I see results?',
    answer: "Most students book their first meeting within 14 days of setup. Full system takes 2 weeks to build. After that, 30-45 days to optimize and scale to 30+ meetings/month. This isn't a get-rich-quick scheme.",
    defaultOpen: false,
  },
  {
    question: "What's included in the training?",
    answer: "30+ hours of step-by-step video training, 78-page implementation guide, visual workflow maps, 500K+ verified lead database, private WhatsApp community access, and complete tech stack setup guides. Everything you need to build the system.",
    defaultOpen: false,
  },
  {
    question: 'Is this just another generic cold email course?',
    answer: "No. Most courses teach you theory. I show you the EXACT system I use daily for paying clients. This is AI agents + automation + intent signals. Not just 'write good subject lines' advice.",
    defaultOpen: false,
  },
  {
    question: 'Can you guarantee I\'ll get meetings?',
    answer: "I can't guarantee anything because I don't know how you'll execute. But 1132+ students have booked meetings with this. If you follow the system exactly and don't get at least 5 meetings in 30 days, I'll refund you 100%.",
    defaultOpen: false,
  },
  {
    question: 'How much time will this take weekly?',
    answer: "Setup: 2 weeks of focused work (10-15 hours total). Maintenance: 30 minutes/week to check performance, add new leads, optimize. The system runs 24/7 automatically.",
    defaultOpen: false,
  },
  {
    question: 'Do I need to buy domains and warm them up?',
    answer: "Yes, but I show you exactly how. Warmup takes 14 days (automated). This is covered in Module 3 with step-by-step instructions. The training includes everything you need to know.",
    defaultOpen: false,
  },
];

export default function FAQ() {
  const [openIndices, setOpenIndices] = useState(
    faqs.map((faq, index) => faq.defaultOpen ? index : null).filter(i => i !== null)
  );

  const toggleFAQ = (index) => {
    setOpenIndices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything You're Probably Wondering:"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 md:mt-12 space-y-3 md:space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass-card rounded-lg md:rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between text-left"
              >
                <span className="text-white font-medium pr-3 md:pr-4 text-sm md:text-base">{faq.question}</span>
                <motion.span
                  animate={{ rotate: openIndices.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple/20 flex items-center justify-center"
                >
                  <HiChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                </motion.span>
              </button>
              
              <AnimatePresence>
                {openIndices.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 md:px-6 pb-4 md:pb-5 pt-0">
                      <div className="h-px bg-white/10 mb-3 md:mb-4" />
                      <p className="text-text-secondary leading-relaxed text-sm md:text-base">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 md:mt-12"
        >
          <p className="text-text-secondary text-sm md:text-base mb-6">
            Still have questions?{' '}
            <a 
              href="mailto:anirudh@theorganicbuzz.com" 
              className="text-gold hover:text-gold-light underline transition-colors"
            >
              Email me directly
            </a>
          </p>
          <Button size="lg" className="w-full sm:w-auto">
            Get Started for ₹999
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
