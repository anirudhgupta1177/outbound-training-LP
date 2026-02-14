import { motion } from 'framer-motion';
import { HiCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { formatLargeAmount, convertINRToUSD } from '../../constants/pricing';
import { useState, memo } from 'react';

// #region agent log
const debugLog = (location, message, data) => {
  fetch('http://127.0.0.1:7242/ingest/a3ca0b1c-20f2-45d3-8836-7eac2fdb4cb3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),runId:'video-debug',hypothesisId:'E-F'})}).catch(()=>{});
};
// #endregion

// #region agent log - InstructorVideo component with lite embed pattern (click to load)
const InstructorVideo = memo(function InstructorVideo() {
  const [isActivated, setIsActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleActivate = () => {
    debugLog('Instructor.jsx:InstructorVideo', 'User clicked to load video', { hypothesisId: 'H' });
    setIsLoading(true);
    setIsActivated(true);
  };
  
  const handleIframeLoad = () => {
    debugLog('Instructor.jsx:InstructorVideo', 'iframe loaded', { hypothesisId: 'H' });
    setIsLoading(false);
  };
  
  return (
    <div className="relative aspect-video bg-dark-secondary rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        {isActivated ? (
          <iframe 
            src="https://www.loom.com/embed/4d7b347472a342b4aee4818d49f9a1df?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&autoplay=1" 
            frameBorder="0"
            allow="autoplay; fullscreen"
            allowFullScreen
            onLoad={handleIframeLoad}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            title="The Complete System Breakdown (6 min)"
          />
        ) : (
          <button
            onClick={handleActivate}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple/20 via-dark-secondary to-gold/10 cursor-pointer group transition-all hover:from-purple/30"
            aria-label="Play video - 6 minute breakdown"
          >
            {/* Thumbnail placeholder */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
            
            {/* Play button */}
            <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold/90 flex items-center justify-center shadow-2xl group-hover:bg-gold group-hover:scale-110 transition-all duration-300">
              <svg className="w-6 h-6 md:w-8 md:h-8 text-dark ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            
            {/* Duration badge */}
            <div className="relative z-10 mt-4 px-3 py-1 bg-dark/80 rounded-full">
              <p className="text-white/90 text-sm font-medium">
                ▶ Watch 6-Min Breakdown
              </p>
            </div>
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

export default function Instructor() {
  const { pricing, isIndia } = usePricing();
  
  // Convert 4.2 Cr to appropriate currency
  const revenueAmount = isIndia ? 42000000 : convertINRToUSD(42000000); // 4.2 Cr INR
  const revenueDisplay = formatLargeAmount(revenueAmount, pricing.currency);
  
  const credentials = [
    'Heading Outbound for Instantly AI - sending 60K emails daily',
    `${revenueDisplay} generated from 1.9M emails sent in 2025`,
    'Booked meetings with billionaires like Sam Altman',
    'Active Community of 1000+ Members',
    '13,000+ LinkedIn Followers',
    'IIT Kharagpur Graduate',
    '1,132+ Students Trained',
  ];

  return (
    <section id="instructor" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-gold/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="I Send 60K Emails Daily for Instantly AI. Now I'm Teaching You How."
          subtitle="(Practitioner First. Teacher Second.)"
          gradient
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mt-8 md:mt-12">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col"
          >
            {/* Glow */}
            <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple to-gold opacity-20 blur-2xl rounded-2xl md:rounded-3xl" />
            
            <InstructorVideo />
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-between"
          >
            {/* Results headline */}
            <div>
              <h3 className="text-base md:text-lg font-display font-bold text-white mb-3 md:mb-4">
                My Personal Background:
            </h3>

            {/* Credentials list */}
              <ul className="space-y-2.5 md:space-y-3">
              {credentials.map((credential, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 md:gap-3"
                >
                    <span className="flex-shrink-0 w-5 h-5 md:w-5 md:h-5 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                      <HiCheck className="w-3 h-3 md:w-3 md:h-3 text-success" />
                  </span>
                    <span className="text-text-secondary text-sm md:text-base font-medium">{credential}</span>
                </motion.li>
              ))}
            </ul>
            </div>

            {/* Why I'm Sharing This */}
            <div className="glass-card rounded-lg md:rounded-xl p-4 md:p-5 border border-purple/30 mt-4 md:mt-6">
              <h4 className="text-sm md:text-base font-display font-bold text-white mb-2 md:mb-3">
                Why I'm Sharing This:
              </h4>
              <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                I'm tired of watching freelancers struggle with problems I solved years ago while fake gurus sell theory. This isn't a course - it's the exact system I use for $5000+/month clients.
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Learn From a Real Practitioner
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
