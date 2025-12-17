import { motion } from 'framer-motion';
import { HiX, HiCheck } from 'react-icons/hi';
import { SectionHeading, CountdownTimer, ProgressBar, Button } from '../ui';

const dontTakeAction = [
  'Keep manually sending 20-30 emails a day',
  'Keep getting 2% reply rates and ghosted',
  'Keep spending 20 hours/week prospecting',
  'Keep watching competitors close deals',
  'Keep having inconsistent income',
  'Keep burning out on manual outreach',
];

const whenYouJoin = [
  'AI finds 1000+ qualified leads while you sleep',
  'System sends 1000+ personalized emails daily',
  'Wake up to booked meetings in your calendar',
  'Spend 30 minutes/week managing the system',
  'Build a predictable pipeline finally',
  'Focus on closing deals, not finding them',
];

export default function Urgency() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background with urgency feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Your Calendar Doesn't Fill Itself. This System Does."
        />

        {/* Two columns comparison */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-12">
          {/* Left - Don't Take Action */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10"
          >
            <h3 className="text-base md:text-lg font-display font-bold text-text-muted mb-3 md:mb-4">
              What Happens If You Don't Take Action:
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {dontTakeAction.map((item, index) => (
                <li key={index} className="flex items-start gap-2 md:gap-3">
                  <span className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                    <HiX className="w-2.5 h-2.5 md:w-3 md:h-3 text-text-muted" />
                  </span>
                  <span className="text-text-muted text-xs md:text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right - When You Join */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 border border-success/30"
          >
            <h3 className="text-base md:text-lg font-display font-bold text-success mb-3 md:mb-4">
              What Happens When You Join Today:
            </h3>
            <ul className="space-y-2 md:space-y-3">
              {whenYouJoin.map((item, index) => (
                <li key={index} className="flex items-start gap-2 md:gap-3">
                  <span className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                    <HiCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                  </span>
                  <span className="text-white text-xs md:text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Center arrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center my-6 md:my-8"
        >
          <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-purple to-gold text-white font-bold text-sm md:text-base">
            You're One Decision Away →
          </div>
        </motion.div>

        {/* Urgency elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/30"
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
              <p className="text-purple-light text-xs md:text-sm font-medium mb-2">📈 Price increases Jan 1st</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-text-muted line-through text-sm">₹1,499</span>
                <span className="text-xl md:text-2xl font-bold gradient-text">₹999</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="xl" className="animate-pulse-gold w-full sm:w-auto">
            Get Instant Access for ₹999
          </Button>
          <p className="text-text-muted text-xs md:text-sm mt-2 md:mt-3">
            ⚡ Instant access after payment | 💳 All payment methods | 🔒 Secure checkout
          </p>
        </motion.div>
      </div>
    </section>
  );
}
