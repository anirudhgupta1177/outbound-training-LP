import { motion } from 'framer-motion';
import { HiCheck, HiLightningBolt } from 'react-icons/hi';
import { Button } from '../ui';

const steps = [
  'Click button above → Secure checkout page',
  'Complete payment → Instant access email sent',
  'Access dashboard → Download all resources',
  'Join community → Start building your system',
  'Book first meeting → Within 14 days',
];

export default function FinalCTA() {
  return (
    <section className="py-12 md:py-24 relative overflow-hidden">
      {/* Background with premium feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-purple/10 to-dark" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-64 h-48 md:h-64 bg-gold/10 rounded-full blur-3xl" />
      </div>
      
      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4 md:mb-6"
        >
          <span className="text-white">Join 1132+ Freelancers & Agencies Who</span>
          <br />
          <span className="gradient-text">Automated Their Outbound</span>
        </motion.h2>

        {/* Mega CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="mb-6 md:mb-8"
        >
          <Button size="xl" className="animate-pulse-gold text-base md:text-xl px-8 md:px-12 py-4 md:py-6 w-full sm:w-auto">
            Get Instant Access for ₹999
          </Button>
          <p className="text-text-muted text-xs md:text-sm mt-2 md:mt-3">
            ⚡ Instant access | 💳 All payment methods | 🔒 Secure checkout
          </p>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-6 md:mb-8"
        >
          <p className="text-text-muted text-xs md:text-sm mb-3 md:mb-4 uppercase tracking-wider">What Happens Next:</p>
          <div className="flex flex-col items-center gap-1.5 md:gap-2 max-w-md mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 md:gap-3 text-text-secondary text-xs md:text-sm"
              >
                <span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                  {index + 1}
                </span>
                {step}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Urgency reminder */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap justify-center gap-2 md:gap-4 text-xs md:text-sm mb-6 md:mb-8"
        >
          <span className="text-gold">⏰ Bonuses expire in 48hrs</span>
          <span className="text-gold">🔥 44/50 spots filled</span>
          <span className="text-purple-light">📈 Price increases January 1st</span>
        </motion.div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 md:gap-4 flex-wrap mb-4 md:mb-6"
        >
          {['Visa', 'Mastercard', 'UPI', 'Net Banking', 'Paytm'].map((method, index) => (
            <div
              key={index}
              className="px-2 md:px-3 py-1 md:py-1.5 bg-white/5 rounded text-text-muted text-xs"
            >
              {method}
            </div>
          ))}
        </motion.div>

        {/* Live ticker simulation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-success/10 border border-success/30"
        >
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-success text-xs md:text-sm">
            Rahul from Mumbai joined 3 minutes ago
          </span>
        </motion.div>
      </div>
    </section>
  );
}
