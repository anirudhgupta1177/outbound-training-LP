import { motion } from 'framer-motion';
import { SectionHeading, CountdownTimer, ProgressBar, Button } from '../ui';

export default function Urgency() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background with urgency feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why You Need to Join Now:"
        />

        {/* Urgency elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/30 mt-8 md:mt-12"
        >
          <div className="grid sm:grid-cols-3 gap-4 md:gap-6 items-center">
            {/* Countdown */}
            <div className="text-center">
              <p className="text-gold text-xs md:text-sm font-medium mb-2">⏰ Bonuses expire in:</p>
              <CountdownTimer hours={48} />
            </div>

            {/* Progress bar */}
            <div className="text-center">
              <p className="text-gold text-xs md:text-sm font-medium mb-2">🔥 Spots filling fast</p>
              <ProgressBar current={44} total={50} label="spots filled" />
            </div>

            {/* Price increase */}
            <div className="text-center">
              <p className="text-purple-light text-xs md:text-sm font-medium mb-2">📈 Price increases soon</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-text-muted line-through text-sm">₹14,999</span>
                <span className="text-xl md:text-2xl font-bold gradient-text">₹3497</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="xl" className="animate-pulse-gold w-full sm:w-auto">
            Get Instant Access for ₹3497
          </Button>
          <p className="text-text-muted text-xs md:text-sm mt-2 md:mt-3">
            ⚡ Instant access after payment | 💳 All payment methods | 🔒 Secure checkout
          </p>
        </motion.div>
      </div>
    </section>
  );
}
