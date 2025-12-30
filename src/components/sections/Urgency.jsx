import { motion } from 'framer-motion';
import { SectionHeading, CountdownTimer, ProgressBar, Button } from '../ui';

export default function Urgency() {
  // Calculate dynamic urgency text - spots filled increases gradually and resets every 2 weeks (matching Hero section)
  const getSpotsFilled = () => {
    const now = new Date();
    const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
    const twoWeekCycle = daysSinceEpoch % 14; // 0-13
    const baseSpots = 38;
    // Gradually increases from 38 to 50 over 14 days (12 spots over 14 days ≈ 0.857 per day)
    const spotsFilled = Math.min(50, baseSpots + Math.floor(twoWeekCycle * (12 / 14)));
    return spotsFilled;
  };

  // Calculate timer - resets daily, cycles from 58 hours down to 34 hours (58-24)
  const getTimerHours = () => {
    const now = new Date();
    const hoursSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60));
    const dayCycle = hoursSinceEpoch % 24; // 0-23 hours in a day
    // Start at 58 hours, count down by current hour of day
    // At hour 0 of day: 58, at hour 24: 58-24 = 34, then resets
    const timerHours = 58 - dayCycle;
    return Math.max(34, timerHours); // Minimum 34 hours
  };

  const spotsFilled = getSpotsFilled();
  const timerHours = getTimerHours();
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background with urgency feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why You Need to Join Now:"
        />

        {/* Urgency elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl md:rounded-2xl p-6 md:p-8 border border-gold/30 mt-8 md:mt-12"
        >
          <div className="flex flex-col gap-6">
            {/* Headings in one line */}
            <div className="grid sm:grid-cols-3 gap-12 md:gap-16">
              <div className="text-center">
                <p className="text-gold text-sm md:text-base font-medium">🔥 Spots filling fast</p>
              </div>
              <div className="text-center">
                <p className="text-gold text-sm md:text-base font-medium">⏰ Bonuses expire</p>
              </div>
            <div className="text-center">
                <p className="text-gold text-sm md:text-base font-medium">📈 Price increases soon</p>
              </div>
            </div>

            {/* Content below - vertically centered */}
            <div className="grid sm:grid-cols-3 gap-12 md:gap-16 items-center">
              {/* Progress bar - Left */}
              <div className="text-center flex flex-col items-center justify-center w-full min-w-0">
                <div className="w-full max-w-[200px] mx-auto">
                  <ProgressBar current={spotsFilled} total={50} label="spots filled" />
                </div>
              </div>

              {/* Countdown - Middle */}
              <div className="text-center flex flex-col items-center justify-center w-full min-w-0">
                <div className="w-full max-w-[200px] mx-auto">
                  <CountdownTimer hours={timerHours} />
                </div>
            </div>

              {/* Price increase - Right */}
              <div className="text-center flex flex-col items-center justify-center w-full min-w-0">
                <div className="flex items-center justify-center gap-2 max-w-[200px] mx-auto">
                  <span className="text-text-muted line-through text-sm">₹43,999</span>
                  <span className="text-xl md:text-2xl font-bold text-purple">₹3497</span>
                </div>
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
            Stop Wasting Time - Get Started Now
          </Button>
          <p className="text-text-muted text-xs md:text-sm mt-4 md:mt-5">
            ⚡ Instant access after payment | 💳 All payment methods | 🔒 Secure checkout
          </p>
        </motion.div>
      </div>
    </section>
  );
}
