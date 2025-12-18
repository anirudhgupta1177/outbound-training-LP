import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const faqs = [
  {
    question: "I'm not technical. Can I really do this?",
    answer: "If you can use WhatsApp and Gmail, you can do this. Everything is step-by-step, click-by-click. I show you exactly where to click, what to type, and what each button does.",
    defaultOpen: true,
  },
  {
    question: "How quickly can I get started?",
    answer: "You get instant access after payment. Most students complete the setup within 2 weeks and start seeing results in their first 30 days.",
    defaultOpen: true,
  },
  {
    question: 'Will this work in India / for Indian businesses?',
    answer: "This is BUILT for the Indian market. All examples are from Indian businesses. The lead database includes Indian companies. 1132+ Indian freelancers and agencies are already using this.",
    defaultOpen: false,
  },
  {
    question: "I've tried cold email before. It never works.",
    answer: "Because you didn't have: (1) Intent signals to find people ready to buy, (2) AI personalization that makes every email unique, (3) Proper email infrastructure to avoid spam. This system has all three.",
    defaultOpen: false,
  },
  {
    question: 'How long until I see results?',
    answer: "Most students book their first meeting within 14 days of setup. Full system takes 2 weeks to build. After that, 30-45 days to optimize and scale to 30+ meetings/month.",
    defaultOpen: false,
  },
  {
    question: "What's included in the training?",
    answer: "30+ hours of step-by-step video training, 78-page implementation guide, visual workflow maps, 500K+ verified lead database, private WhatsApp community access, and complete tech stack setup guides.",
    defaultOpen: false,
  },
  {
    question: 'Is this just another generic cold email course?',
    answer: "No. Most courses teach you theory. I show you the EXACT system I use daily for paying clients. This is AI agents + automation + intent signals.",
    defaultOpen: false,
  },
  {
    question: "What's the refund policy?",
    answer: "If you complete 100% of the training and still don't find value, email me and I'll refund you 100%. No questions asked.",
    defaultOpen: false,
  },
  {
    question: 'How much time will this take weekly?',
    answer: "Setup: 2 weeks of focused work (10-15 hours total). Maintenance: 30 minutes/week to check performance, add new leads, optimize. The system runs 24/7 automatically.",
    defaultOpen: false,
  },
  {
    question: 'Do I need to buy domains and warm them up?',
    answer: "Yes, but I show you exactly how. Warmup takes 14 days (automated). This is covered in Module 3 with step-by-step instructions.",
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

  // Split FAQs into two columns
  const midPoint = Math.ceil(faqs.length / 2);
  const leftColumn = faqs.slice(0, midPoint);
  const rightColumn = faqs.slice(midPoint);

  const FAQItem = ({ faq, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-lg overflow-hidden"
    >
      <button
        onClick={() => toggleFAQ(index)}
        className="w-full px-3 md:px-4 py-3 md:py-4 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium pr-2 text-xs md:text-sm">{faq.question}</span>
        <motion.span
          animate={{ rotate: openIndices.includes(index) ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-purple/20 flex items-center justify-center"
        >
          <HiChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gold" />
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
            <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
              <div className="h-px bg-white/10 mb-2 md:mb-3" />
              <p className="text-text-secondary leading-relaxed text-xs md:text-sm">
                {faq.answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <section id="faq" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything You're Probably Wondering:"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 md:mt-12 grid md:grid-cols-2 gap-3 md:gap-4"
        >
          {/* Left Column */}
          <div className="space-y-3 md:space-y-4">
            {leftColumn.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
          
          {/* Right Column */}
          <div className="space-y-3 md:space-y-4">
            {rightColumn.map((faq, index) => (
              <FAQItem key={index + midPoint} faq={faq} index={index + midPoint} />
            ))}
          </div>
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
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
            Get Started for ₹3497
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
