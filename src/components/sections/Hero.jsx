import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiFire } from 'react-icons/hi';
import { Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';

// Video component with loading state
const HeroVideo = memo(function HeroVideo() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative bg-[#1a1a2e] rounded-xl md:rounded-2xl overflow-hidden">
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        <iframe
          src="https://www.loom.com/embed/bf92afc68fe444c7ad49088ff502c225?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&hideEmbedCaptions=true&t=0"
          frameBorder="0"
          allow="autoplay; fullscreen"
          allowFullScreen
          onLoad={() => setIsLoaded(true)}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#1a1a2e' }}
          title="Video"
        />
      </div>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] z-10">
          <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});


// Calculate urgency text once (it only changes daily)
const getUrgencyText = () => {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const twoWeekCycle = daysSinceEpoch % 14;
  const baseSpots = 38;
  const spotsFilled = Math.min(50, baseSpots + Math.floor(twoWeekCycle * (12 / 14)));
  return `${spotsFilled}/50 spots filled`;
};

function Hero() {
  const { pricing } = usePricing();
  const urgencyText = getUrgencyText();

  return (
    <section className="relative pt-20 md:pt-28 pb-12 md:pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-gold/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Social Proof Bar */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-4 md:mb-6">
            <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs md:text-sm">
              <HiFire className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">1132+ freelancers & agencies using this</span>
              <span className="sm:hidden">1132+ users</span>
            </span>
            <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs md:text-sm">
              <HiStar className="w-3 h-3 md:w-4 md:h-4" />
              4.9/5 rating
            </span>
            <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs md:text-sm">
              📧 1.9M Emails Sent in 2025
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight mb-3 md:mb-4">
            <span className="gradient-text">30+ Qualified Sales Meetings</span>
            <br />
            <span className="text-white">Every Month. On Complete Autopilot.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-base md:text-lg text-text-secondary mb-6 md:mb-8 max-w-2xl mx-auto">
            The AI-powered system filling calendars for 1132+ companies and freelancers - without cold calling, without ads, without burning out
          </p>

          {/* Loom Video — horizontal, directly under the subheading */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative max-w-4xl mx-auto mb-6 md:mb-8"
          >
            <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple to-gold opacity-30 blur-2xl rounded-3xl" />
            <div className="relative">
              <HeroVideo />
            </div>
          </motion.div>

          {/* CTA */}
          <div className="flex justify-center mb-4">
            <Button size="lg" className="animate-pulse-gold w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
              Start Filling Your Calendar for {pricing.displayPrice}
            </Button>
          </div>

          {/* Trust Elements */}
          <div className="space-y-2 md:space-y-3">
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-xs md:text-sm">
              <span className="flex items-center gap-1.5 md:gap-2 text-text-muted">
                <span className="text-gold">💳</span> One-time payment
              </span>
              <span className="flex items-center gap-1.5 md:gap-2 text-text-muted">
                <span className="text-gold">🔒</span> 30-day guarantee
              </span>
              <span className="flex items-center gap-1.5 md:gap-2 text-text-muted">
                <span className="text-gold">⚡</span> Instant access
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
              <span className="flex items-center gap-1.5 md:gap-2 text-gold">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-gold animate-pulse" />
                Limited spots available
              </span>
              <span className="text-gold font-medium">
                {urgencyText}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Memoize the Hero component to prevent unnecessary re-renders
export default memo(Hero);
