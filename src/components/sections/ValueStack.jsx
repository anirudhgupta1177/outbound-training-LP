import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const items = [
  { name: '30+ hours of video training', value: '₹15,000' },
  { name: '78-page implementation guide', value: '₹3,000' },
  { name: 'All automation workflow maps', value: '₹5,000' },
  { name: '500K verified lead database', value: '₹8,000' },
  { name: 'Private community access', value: '₹2,000' },
  { name: 'Bonus: Complete system setup guide', value: '₹4,000' },
];

const comparison = [
  { what: 'Hiring a BDR', cost: '₹25,000/month' },
  { what: 'Sales agency retainer', cost: '₹40,000/month' },
  { what: 'Similar courses', cost: '₹15,000-₹50,000' },
  { what: 'Building this yourself', cost: '200+ hours' },
];

export default function ValueStack() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-secondary to-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Get the Complete AI-Powered Outbound System"
          subtitle="For Less Than One Sales Tool Subscription"
          gradient
        />

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mt-8 md:mt-12">
          {/* Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-purple to-gold opacity-20 blur-2xl rounded-2xl md:rounded-3xl" />
            
            <div className="relative glass-card rounded-xl md:rounded-2xl p-5 md:p-8 border border-gold/30">
              {/* Price header */}
              <div className="text-center mb-4 md:mb-6">
                <p className="text-text-muted line-through text-lg md:text-xl">₹14,999</p>
                <p className="text-4xl md:text-5xl font-display font-bold gradient-text">₹999</p>
                <p className="text-text-muted text-xs md:text-sm mt-1">+ GST • One-time payment • Lifetime access</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent my-4 md:my-6" />

              {/* What you get */}
              <p className="text-white font-bold mb-3 md:mb-4 text-sm md:text-base">What You Get Today:</p>
              <ul className="space-y-2 md:space-y-3">
                {items.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 md:gap-3"
                  >
                    <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <HiCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                    </span>
                    <span className="text-text-secondary text-xs md:text-sm flex-1">{item.name}</span>
                    <span className="text-text-muted text-xs line-through">{item.value}</span>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center gap-2 md:gap-3"
                >
                  <span className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <HiCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-gold" />
                  </span>
                  <span className="text-gold text-xs md:text-sm font-medium">30-day money-back guarantee</span>
                </motion.li>
              </ul>
            </div>
          </motion.div>

          {/* Comparison Box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
              <h4 className="text-base md:text-lg font-display font-bold text-white mb-3 md:mb-4">
                What Others Charge:
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {comparison.map((item, index) => (
                  <li key={index} className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-text-secondary">{item.what}</span>
                    <span className="text-gold/80 font-medium">{item.cost}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/10">
                <p className="text-gold font-medium text-center text-sm md:text-base">
                  Or learn the system once for <span className="text-xl md:text-2xl font-bold">₹999</span>
                </p>
              </div>
            </div>

            {/* CTA */}
            <Button size="xl" className="w-full animate-pulse-gold">
              Get Instant Access for ₹999
            </Button>

            {/* Trust elements */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4 text-xs text-text-muted">
              <span>🔒 Secure payment</span>
              <span>💳 All methods accepted</span>
              <span>✅ Instant access</span>
              <span>🔄 30-day guarantee</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
