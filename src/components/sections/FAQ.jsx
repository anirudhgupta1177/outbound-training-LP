import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';

const faqs = [
  {
    question: "What will tools/software cost me each month?",
    answer: ({ isIndia }) => (
      <>
        Honest answer: it depends on how serious you are.
        <br /><br />
        • <strong>Budget path (near-zero):</strong> Run the system manually at small scale using free trials of the tools taught. Possible to start at close to {isIndia ? '₹0' : '$0'} recurring.
        <br />
        • <strong>Mid-volume (serious path):</strong> ~<strong>{isIndia ? '₹30,000–₹40,000' : '$360–$480'}/month</strong> in tech stack (mailboxes, sending tool, AI credits).
        <br />
        • <strong>High-volume automation:</strong> Some companies spend <strong>{isIndia ? '₹2L+' : '$2,400+'}/month</strong> for the same meeting count but at massive scale.
        <br /><br />
        <strong>One-time cost:</strong> only domains. Everything else (mailboxes, Instantly, AI credits) is recurring.
        <br /><br />
        The course also teaches <strong>free / open-source alternatives</strong> (including open-source LLMs) so you can run the whole system without paid Clay or GPT API subscriptions if budget is the constraint.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "Do I need to pay for Clay, Apollo, or GPT API keys?",
    answer: (
      <>
        <strong>No — not required.</strong> The course specifically teaches free and open-source alternatives for:
        <br />
        • Lead research and enrichment
        <br />
        • AI personalization (using open-source LLMs instead of paid GPT APIs)
        <br /><br />
        If you want to use paid tools like Clay or Apollo for faster execution, you can — but the system is designed so you can run it end-to-end without expensive subscriptions.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "I have zero experience. Is this too advanced for me?",
    answer: (
      <>
        Not at all. The course is structured for beginners and goes deep enough for experienced operators.
        <br /><br />
        • <strong>10+ hours</strong> dedicated to <strong>Cursor</strong> from scratch
        <br />
        • <strong>10+ hours</strong> dedicated to <strong>Clay</strong> from scratch
        <br />
        • <strong>Ready-to-import blueprints</strong> for Make.com and n8n — you don't build workflows from zero
        <br />
        • <strong>No coding required</strong> — everything runs on no-code tools
        <br /><br />
        The 1,100+ member WhatsApp community is there for every step, and Ani personally responds to relevant queries.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How quickly can I get started?",
    answer: "Instant course access after payment. Most students launch their first campaign within 2–3 weeks of starting — results (replies, meetings) typically show up in the first week of a live campaign.",
    defaultOpen: false,
  },
  {
    question: "Does this only work for Indian companies targeting Indian clients?",
    answer: ({ isIndia }) =>
      `No — the system is geography-agnostic. The 500K+ verified CXO email database covers US and EU decision-makers across SaaS, IT, Marketing, and other industries. Most students target international markets where budgets are higher — the same stack powers Instantly.ai's global outbound at 60K emails/day. If you want to charge $2,000–5,000 per project instead of ${isIndia ? '₹20,000' : '$240'}, this system helps you reach those international decision-makers.`,
    defaultOpen: false,
  },
  {
    question: "I've tried cold email before. It never works.",
    answer: (
      <>
        Because generic cold email is missing three critical pieces:
        <br /><br />
        • <strong>Intent signals</strong> — You were emailing random people. This system targets companies showing ACTIVE buying intent (hiring, funding, tech changes).
        <br />
        • <strong>AI personalization at scale</strong> — You were using templates. This system writes 1,000+ unique emails per day tailored to each prospect.
        <br />
        • <strong>Infrastructure</strong> — Your emails went to spam. You'll set up diversified sending (multiple domains, warmup, SPF/DKIM/DMARC) with a target <strong>99% email health score</strong>.
        <br /><br />
        The course also includes <strong>12 cold email sequence frameworks tested across 1,000+ campaigns</strong> — so you're not guessing at copy either.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How long until I see results?",
    answer: (
      <>
        <strong>Course length:</strong> 45+ hours (self-paced).
        <br /><br />
        Students who implement <em>while</em> learning typically:
        <br />
        • Launch their first campaign within <strong>2–3 weeks</strong>
        <br />
        • See first replies and meetings booked in the <strong>first week</strong> of a live campaign
        <br /><br />
        Target benchmarks from the course: <strong>8%+ reply rate</strong> (industry average is 1%). Ani's own optimized campaigns have hit 26.5–33.2% reply rates.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "What's included in the training?",
    answer: ({ isIndia }) => (
      <>
        • <strong>45+ hours</strong> of step-by-step video training
        <br />
        • <strong>78-page</strong> implementation guide with screenshots
        <br />
        • Visual workflow maps & <strong>ready-to-import Make/n8n blueprints</strong>
        <br />
        • <strong>500K+ verified CXO</strong> email database (US & EU decision-makers)
        <br />
        • Private <strong>WhatsApp community</strong> (1,100+ active members)
        <br />
        • <strong>BONUS:</strong> Complete end-to-end setup guide
        <br />
        • Ani's proprietary <strong>Instagram Outbound System</strong> — included free
        <br /><br />
        Total stated value: {isIndia ? '₹44,000+' : '$530+'}. Lifetime access, one-time payment.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How is this different from other cold email courses?",
    answer: (
      <>
        • <strong>Practitioner, not guru</strong> — Ani heads Outbound at <strong>Instantly.ai</strong> (helped scale it to $45M+ ARR) and runs 60,000 emails/day live.
        <br />
        • <strong>Free / open-source paths</strong> — You're not locked into paid Clay or GPT API subscriptions.
        <br />
        • <strong>Ready-to-deploy assets</strong> — 500K lead database + Make/n8n blueprints you import and run. Not starting from zero.
        <br />
        • <strong>Deep-dive modules</strong> — 10+ hours on Cursor, 10+ hours on Clay.
        <br />
        • <strong>Multi-channel</strong> — Cold email + LinkedIn (HeyReach, Trigify) + Instagram outbound, not just email.
        <br />
        • <strong>Active community</strong> — 1,100+ members, not a dead Slack channel.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "What's the refund policy?",
    answer: "30-day money-back guarantee. Complete 100% of the course — if you don't find value, you get a full refund, no questions asked.",
    defaultOpen: false,
  },
  {
    question: "Are there any upsells? Do I need to spend extra to get results?",
    answer: (
      <>
        <strong>No mandatory upsells.</strong> Everything needed to build and run the system is inside the course. Most of the 1,100+ students run their systems independently using only course material.
        <br /><br />
        Optional (not required) offers that exist separately:
        <br />
        • <strong>$97 Cold Email DFY Setup</strong> — team builds your first campaign for you
        <br />
        • <strong>DFY BuildOut ($4,000+)</strong> — full 4-month managed implementation
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "How much time will this take weekly?",
    answer: (
      <>
        <strong>Setup phase:</strong> 10–15 hours over 2–3 weeks (learning + building your first campaign).
        <br /><br />
        <strong>Once running:</strong> ~30 minutes/week to:
        <br />
        • Check campaign performance
        <br />
        • Respond to qualified replies (AI + automation handle the rest)
        <br />
        • Add new lead lists
        <br />
        • Minor optimizations
        <br /><br />
        Compare that to 20+ hours/week of manual prospecting.
      </>
    ),
    defaultOpen: false,
  },
  {
    question: "Will this work for my specific industry/service?",
    answer: (
      <>
        If you sell B2B, yes. The system is niche-agnostic and works for:
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
        The ICP targeting — taught in Stage 1 — is what makes it work for your specific offer. Only the targeting criteria and messaging change based on your ideal customer profile.
      </>
    ),
    defaultOpen: false,
  },
];

function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03 }}
      className="glass-card rounded-lg overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-3 md:px-4 py-3 md:py-4 flex items-center justify-between text-left"
      >
        <span className="text-white font-medium pr-2 text-xs md:text-sm">{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-purple/20 flex items-center justify-center"
        >
          <HiChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gold" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
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
}

export default function FAQ() {
  const { pricing, isIndia } = usePricing();
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

  // Resolve dynamic (function-based) answers with the current currency context.
  const processedFAQs = faqs.map(faq => ({
    ...faq,
    answer: typeof faq.answer === 'function' ? faq.answer({ isIndia }) : faq.answer,
  }));

  // Split FAQs into two columns
  const midPoint = Math.ceil(processedFAQs.length / 2);
  const leftColumn = processedFAQs.slice(0, midPoint);
  const rightColumn = processedFAQs.slice(midPoint);

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
              <FAQItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openIndices.includes(index)}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-3 md:space-y-4">
            {rightColumn.map((faq, index) => {
              const absoluteIndex = index + midPoint;
              return (
                <FAQItem
                  key={absoluteIndex}
                  faq={faq}
                  index={absoluteIndex}
                  isOpen={openIndices.includes(absoluteIndex)}
                  onToggle={() => toggleFAQ(absoluteIndex)}
                />
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Get Started for {pricing.displayPrice}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
