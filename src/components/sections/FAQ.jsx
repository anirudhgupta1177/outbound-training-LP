import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const faqs = [
  {
    question: "I have zero experience. Is this too advanced for me?",
    answer: (
      <>
        Not at all. This course teaches you the <strong>STRATEGY</strong> and <strong>PSYCHOLOGY</strong> behind outbound, not just button-clicking.
        <br /><br />
        Yes, you'll learn the tools (Clay, Make.com, etc.), but more importantly, you'll understand:
        <br />
        • <strong>WHY</strong> intent-led targeting works
        <br />
        • <strong>HOW</strong> to craft messaging that converts
        <br />
        • <strong>WHEN</strong> to send, follow up, and qualify leads
        <br /><br />
        The tools are just vehicles. I teach you how to drive. And the 1,132+ member community is there if you ever get stuck on technical setup.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How quickly can I get started?",
    answer: "You get instant access after payment. Most students complete the setup within 2 weeks and start seeing results in their first 30 days.",
    defaultOpen: false,
  },
  {
    question: "Does this only work for Indian companies targeting Indian clients?",
    answer: "No - this is designed for Indian freelancers and agencies to target GLOBAL markets. The 500K+ lead database includes companies from US, UK, Europe, Australia, and more. Most of my students (and my own clients) are targeting international markets where budgets are higher. If you want to charge $2,000-5,000 per project instead of ₹20,000, this system helps you reach those international decision-makers.",
    defaultOpen: false,
  },
  {
    question: "I've tried cold email before. It never works.",
    answer: (
      <>
        Because you were missing three critical pieces:
        <br /><br />
        • <strong>Intent signals</strong> — You were emailing random people. This system targets only companies showing ACTIVE buying intent (hiring, funding, tech changes).
        <br />
        • <strong>AI personalization</strong> — You were using templates. This system writes unique emails for each prospect based on their company, recent activity, and pain points.
        <br />
        • <strong>Infrastructure</strong> — Your emails probably went to spam. This system uses proper deliverability setup (multiple domains, warmup, SPF/DKIM/DMARC) so you actually reach inboxes.
        <br /><br />
        That's why this works when generic cold email doesn't.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How long until I see results?",
    answer: (
      <>
        Here's the honest breakdown:
        <br /><br />
        • <strong>Initial Weeks:</strong> Learn the foundations (ICP, offer, infrastructure setup)
        <br />
        • <strong>Day 0:</strong> Set up tools, configure domains, start warmup
        <br />
        • <strong>In Between:</strong> Build your first campaign, deploy automation
        <br />
        • <strong>Day 14:</strong> First emails go out, replies start coming in, meetings getting booked
        <br /><br />
        Most students book their first meeting within 14 days of setup. If you rush it (skip warmup, bad targeting), you'll fail. Follow the process, and it works.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "What's included in the training?",
    answer: "30+ hours of step-by-step video training, 78-page outbound guide, visual workflow maps, 500K+ verified lead database, private WhatsApp community access, and complete tech stack setup guides.",
    defaultOpen: false,
  },
  {
    question: "How is this different from other cold email courses?",
    answer: (
      <>
        Three main differences:
        <br /><br />
        • <strong>I actually do this daily</strong> - I run outbound for Instantly AI (60K emails/day). This isn't theory from someone who stopped practicing 5 years ago.
        <br />
        • <strong>It's a complete system</strong> - Not just "how to write cold emails." You get lead scraping, AI personalization, automation, deliverability, copywriting - the full stack.
        <br />
        • <strong>Ready-to-deploy assets</strong> - 500K lead database, automation blueprints, proven templates. You're not starting from zero.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "What's the refund policy?",
    answer: "If you complete 100% of the training and still don't find value, email me and I'll refund you 100%. No questions asked.",
    defaultOpen: false,
  },
  {
    question: "How much time will this take weekly?",
    answer: (
      <>
        <strong>Setup phase:</strong> 10-15 hours over 2 weeks (learning + building)
        <br /><br />
        <strong>Once running:</strong> 30 minutes/week for:
        <br />
        • Checking campaign performance
        <br />
        • Responding to qualified replies (AI handles the rest)
        <br />
        • Adding new lead lists
        <br />
        • Minor optimizations
        <br /><br />
        Compare that to 20+ hours/week of manual prospecting. This is a 40X time savings.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "Will this work for my specific industry/service?",
    answer: (
      <>
        If you sell B2B services or products, yes. This works for:
        <br />
        • Freelancers (dev, design, content, marketing)
        <br />
        • Agencies (marketing, software, creative)
        <br />
        • Consultants & coaches
        <br />
        • SaaS companies
        <br />
        • B2B service providers
        <br /><br />
        The system is the same. Only the targeting criteria and messaging change based on YOUR ideal customer profile (which I teach you how to define in Module 1).
      </>
    ),
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
              <div className="text-text-secondary leading-relaxed text-xs md:text-sm">
                {faq.answer}
              </div>
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
            Get Started for {pricing.displayPrice}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
