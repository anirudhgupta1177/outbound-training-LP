import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiStar, HiFire } from 'react-icons/hi';
import { Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';

// #region agent log
const debugLog = (location, message, data) => {
  fetch('http://127.0.0.1:7242/ingest/a3ca0b1c-20f2-45d3-8836-7eac2fdb4cb3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),runId:'video-debug',hypothesisId:'A-D'})}).catch(()=>{});
};
// #endregion

// #region agent log - HeroVideo component with lite embed pattern (click to load)
const HeroVideo = memo(function HeroVideo({ debugLog }) {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleActivate = () => {
    debugLog('Hero.jsx:HeroVideo', 'User clicked to load video', { hypothesisId: 'H' });
    setIsLoading(true);
    setIsActivated(true);
  };
  
  const handleIframeLoad = () => {
    debugLog('Hero.jsx:HeroVideo', 'iframe loaded', { hypothesisId: 'H' });
    setIsLoading(false);
  };
  
  return (
    <div className="relative bg-dark-secondary rounded-xl md:rounded-2xl overflow-hidden">
      <div style={{ position: 'relative', paddingBottom: '177.77777777777777%', height: 0 }}>
        {isActivated ? (
          <iframe 
            src="https://www.loom.com/embed/184abed1210c4ac88940d6cd3a62a726?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&hideEmbedCaptions=true&t=0&autoplay=1" 
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={handleIframeLoad}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="Video"
          />
        ) : (
          <button
            onClick={handleActivate}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple/20 to-dark-secondary cursor-pointer group transition-all hover:from-purple/30"
            aria-label="Play video"
          >
            {/* Thumbnail placeholder with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-purple/10" />
            
            {/* Play button */}
            <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold/90 flex items-center justify-center shadow-2xl group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-dark ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            
            {/* Text label */}
            <p className="relative z-10 mt-4 text-white/80 text-sm font-medium">
              Click to play video
            </p>
          </button>
        )}
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-secondary/90 z-20">
          <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});
// #endregion


// Memoize benefits to prevent re-creation on every render
const BENEFITS = [
  'Wake up to booked meetings in your calendar',
  'Never manually prospect again',
  'Only talk to prospects ready to buy NOW',
  'Runs 24/7 without you lifting a finger',
];

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
    <section className="relative min-h-screen pt-20 md:pt-32 pb-4 md:pb-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-gold/10 rounded-full blur-3xl" />
      
      <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* F-Shape Layout: Content flows left-to-right, then down */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Main Content (F-shape reading pattern) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left order-1"
          >
            {/* Social Proof Bar - First scan line */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 md:gap-4 mb-4 md:mb-6">
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
                🎓 Learn from IITian
              </span>
              <span className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs md:text-sm">
                📧 1.9M Emails Sent in 2025
              </span>
            </div>

            {/* Main Headline - Second scan line (MOST IMPORTANT) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight mb-3 md:mb-4">
              <span className="gradient-text">30+ Qualified Sales Meetings</span>
              <br />
              <span className="text-white">Every Month. On Complete Autopilot.</span>
            </h1>

            {/* Subheadline - Third scan line */}
            <p className="text-sm sm:text-base md:text-lg text-text-secondary mb-4 md:mb-6 max-w-xl mx-auto lg:mx-0">
              The AI-powered system filling calendars for 1132+ companies and freelancers - without cold calling, without ads, without burning out
            </p>

            {/* Benefits - Quick scannable list */}
            <ul className="space-y-1.5 md:space-y-2 mb-5 md:mb-6">
              {BENEFITS.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 md:gap-3 text-text-primary justify-center lg:justify-start text-sm md:text-base"
                >
                  <span className="flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <HiCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-success" />
                  </span>
                  {benefit}
                </motion.li>
              ))}
            </ul>

            {/* CTAs - Primary action area */}
            <div className="flex flex-col sm:flex-row gap-3 items-center lg:items-start mb-4">
              <Button size="lg" className="animate-pulse-gold w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                Start Filling Your Calendar for {pricing.displayPrice}
              </Button>
              <Button variant="outline" size="lg" href="#instructor" className="w-full sm:w-auto text-sm md:text-base px-6 md:px-8 py-3 md:py-4">
                Watch 6-Min Breakdown
              </Button>
            </div>

            {/* Trust Elements */}
            <div className="space-y-2 md:space-y-3">
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm">
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
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4 text-xs md:text-sm">
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

          {/* RIGHT SIDE: Loom Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-[340px] order-2"
          >
            <div className="relative">
              <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple to-gold opacity-30 blur-2xl rounded-3xl" />
              
              <HeroVideo debugLog={debugLog} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 md:w-6 md:h-10 rounded-full border-2 border-text-muted flex justify-center pt-1.5 md:pt-2"
        >
          <motion.div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-gold" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Memoize the Hero component to prevent unnecessary re-renders
export default memo(Hero);
