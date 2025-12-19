import { motion } from 'framer-motion';
import { HiX, HiCheck, HiArrowRight } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const beforeItems = [
  {
    main: 'Manually hunting for leads for hours with zero targeting',
    sub: 'Wrong emails, wrong timing, zero results',
  },
  {
    main: 'Copy-pasting the same template to 100 people',
    sub: 'Getting 1-2 replies if you\'re lucky',
  },
  {
    main: 'Manually following up with everyone',
    sub: 'While your competitors already closed them',
  },
  {
    main: 'Struggling with inconsistent revenue',
    sub: 'Never knowing where the next client will come from',
  },
];

const afterItems = [
  {
    main: 'AI scrapes 10,000+ verified leads ready to buy NOW',
    sub: 'Multiple sources, perfect timing, high intent',
  },
  {
    main: 'AI writes personalized unique email for each prospect',
    sub: 'Taking insights from their recent activity, website & LinkedIn',
  },
  {
    main: 'System responds immediately and books meetings',
    sub: 'You\'re the first one in their inbox, every time',
  },
  {
    main: 'Complete system that works 24/7 on autopilot',
    sub: 'Predictable pipeline you can count on',
  },
];

export default function BeforeAfter() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-secondary to-dark" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Still Wasting 40+ Hours a Week Manually Prospecting... And Getting Ghosted?"
        />

        <div className="grid md:grid-cols-2 gap-6 lg:gap-12 mt-8 md:mt-12 relative">
          {/* Center Arrow - Desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 rounded-full bg-gradient-to-r from-purple to-gold text-white font-bold shadow-lg">
              <span className="text-xs md:text-sm">There's a better way</span>
              <HiArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
          </motion.div>

          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-8 h-full grayscale hover:grayscale-0 transition-all duration-500 border border-white/10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <HiX className="w-5 h-5 md:w-6 md:h-6 text-text-muted" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-display font-bold text-white">The Old Broken Way</h3>
                </div>
              </div>

              {/* Pain points */}
              <ul className="space-y-3 md:space-y-4">
                {beforeItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-lg p-3 md:p-4"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                        <HiX className="w-3 h-3 md:w-4 md:h-4 text-text-muted" />
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">{item.main}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Mobile arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex md:hidden justify-center"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple to-gold text-white font-bold text-sm">
              <span>There's a better way</span>
              <HiArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple to-gold opacity-20 blur-xl rounded-xl md:rounded-2xl" />
            
            <div className="relative glass-card rounded-xl md:rounded-2xl p-4 md:p-8 h-full border border-gold/30">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <HiCheck className="w-5 h-5 md:w-6 md:h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-display font-bold gradient-text">The AI-Powered System</h3>
                </div>
              </div>

              {/* Benefits */}
              <ul className="space-y-3 md:space-y-4">
                {afterItems.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card rounded-lg p-3 md:p-4 border border-success/20"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                        <HiCheck className="w-3 h-3 md:w-4 md:h-4 text-success" />
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm md:text-base">{item.main}</p>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Bottom Call-Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gold/30 bg-gradient-to-r from-purple/10 to-gold/10">
            <p className="text-base md:text-xl text-white font-medium">
              While you're manually sending 20 emails a day, this system is booking{' '}
              <span className="gradient-text font-bold">30+ meetings a month</span> on autopilot.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Switch to the Better Way
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
