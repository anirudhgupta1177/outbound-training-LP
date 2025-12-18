import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiCheck, HiVolumeUp, HiVolumeOff, HiPlay, HiStar, HiFire } from 'react-icons/hi';
import { Button } from '../ui';

const benefits = [
  'Never manually hunt for leads again',
  'AI personalizes every email in seconds',
  'Only talk to prospects ready to buy NOW',
  'Runs 24/7 without you lifting a finger',
];

export default function Hero() {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = 1.2;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.playbackRate = 1.2;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleMuteToggle = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoError = () => setVideoError(true);

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
            </div>

            {/* Main Headline - Second scan line (MOST IMPORTANT) */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight mb-3 md:mb-4">
              <span className="gradient-text">30+ Qualified Sales Meetings</span>
              <br />
              <span className="text-white">Every Month. On Complete Autopilot.</span>
            </h1>

            {/* Subheadline - Third scan line */}
            <p className="text-sm sm:text-base md:text-lg text-text-secondary mb-4 md:mb-6 max-w-xl mx-auto lg:mx-0">
              Using AI Agents to Web Scrape 10,000+ Ideal Clients and Send 1000+ Hyper-Personalized Emails Daily — All While You Sleep
            </p>

            {/* Benefits - Quick scannable list */}
            <ul className="space-y-1.5 md:space-y-2 mb-5 md:mb-6">
              {benefits.map((benefit, index) => (
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
                Get Instant Access for ₹3497
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
                  42/50 spots filled
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-[340px] order-2"
          >
            <div className="relative">
              <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple to-gold opacity-30 blur-2xl rounded-3xl" />
              
              <div 
                className="video-container relative aspect-[9/16] bg-dark-secondary rounded-xl md:rounded-2xl overflow-hidden cursor-pointer"
                onClick={handlePlayPause}
              >
                {!videoError ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    muted={isMuted}
                    preload="auto"
                    onError={handleVideoError}
                  >
                    <source src="/videos/vsl.mov" type="video/mp4" />
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple/20 to-gold/20">
                    <div className="text-center p-4 md:p-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                        <HiPlay className="w-8 h-8 md:w-10 md:h-10 text-gold" />
                      </div>
                      <p className="text-white font-medium text-sm md:text-base">60-Second VSL</p>
                    </div>
                  </div>
                )}

                {!isPlaying && !videoError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30"
                    >
                      <HiPlay className="w-8 h-8 md:w-10 md:h-10 text-dark ml-1" />
                    </motion.div>
                  </motion.div>
                )}

                {!videoError && (
                  <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 z-10">
                    <button
                      onClick={handleMuteToggle}
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? <HiVolumeOff size={16} className="md:w-5 md:h-5" /> : <HiVolumeUp size={16} className="md:w-5 md:h-5" />}
                    </button>
                  </div>
                )}

                <div className="video-overlay" />
              </div>
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
