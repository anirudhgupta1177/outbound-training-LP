import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { usePricing } from '../../contexts/PricingContext';
import { useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Urgency helpers (stable across renders - recalculates only daily)  */
/* ------------------------------------------------------------------ */
const getSpotsFilled = () => {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const twoWeekCycle = daysSinceEpoch % 14;
  const baseSpots = 38;
  return Math.min(50, baseSpots + Math.floor(twoWeekCycle * (12 / 14)));
};

/* ------------------------------------------------------------------ */
/*  Background Particles (15-20 on desktop, 8-10 on mobile)            */
/* ------------------------------------------------------------------ */
const PARTICLE_COUNT = 18;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: 3 + Math.random() * 2,
  delay: Math.random() * 10,
  duration: 8 + Math.random() * 12,
  opacity: 0.15 + Math.random() * 0.1,
}));

const BackgroundParticles = memo(function BackgroundParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={p.id}
          className={`absolute rounded-full animate-particle-drift ${i >= 10 ? 'hidden md:block' : ''}`}
          style={{
            left: p.left,
            bottom: `-${p.size}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: '#22D3EE',
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes particle-drift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          5% { opacity: var(--tw-opacity, 0.25); }
          95% { opacity: var(--tw-opacity, 0.25); }
          100% { transform: translateY(-110vh) translateX(15px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-particle-drift { animation: none !important; }
        }
        .animate-particle-drift {
          animation: particle-drift linear infinite;
        }
      `}</style>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Video component with gradient border + speed badge                 */
/* ------------------------------------------------------------------ */
const HeroVideo = memo(function HeroVideo() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative max-w-[640px] mx-auto">
      <div
        className="rounded-xl md:rounded-2xl overflow-hidden"
        style={{
          padding: '1px',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.4), transparent)',
        }}
      >
        <div className="relative bg-[#1a1a2e] rounded-xl md:rounded-2xl overflow-hidden">
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src="https://www.loom.com/embed/bf92afc68fe444c7ad49088ff502c225?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&hideEmbedCaptions=true&t=0"
              frameBorder="0"
              allow="autoplay; fullscreen"
              allowFullScreen
              loading="eager"
              fetchPriority="high"
              onLoad={() => setIsLoaded(true)}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                backgroundColor: '#1a1a2e',
              }}
              title="How to book 5-10 sales calls per week with AI outbound"
            />
          </div>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a2e] z-10">
              <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}
          <div
            className="absolute top-2 right-2 md:top-3 md:right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] md:text-xs font-medium"
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(34,211,238,0.3)',
              color: '#22D3EE',
            }}
          >
            <span style={{ textDecoration: 'line-through', opacity: 0.5, color: '#9CA3AF' }}>45 min</span>
            <span>1.2x speed</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Scarcity Bar                                                       */
/* ------------------------------------------------------------------ */
const ScarcityBar = memo(function ScarcityBar({ spotsFilled, prefersReducedMotion }) {
  const spotsLeft = 50 - spotsFilled;
  const pct = (spotsFilled / 50) * 100;

  return (
    <div className="w-full max-w-xs mx-auto mt-3" role="status" aria-label={`${spotsFilled} of 50 spots filled`}>
      <div className="relative h-5 rounded-full overflow-hidden bg-white/5 border border-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #06B6D4, #22D3EE)' }}
        >
          {!prefersReducedMotion && (
            <div
              className="absolute right-0 top-0 bottom-0 w-4 animate-pulse"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4))',
                borderRadius: '0 9999px 9999px 0',
              }}
            />
          )}
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-white tracking-wide">
          {spotsFilled} / 50 spots filled
        </span>
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-300">
        <span
          className={`inline-block w-2 h-2 rounded-full bg-red-500 ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
        <span>Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left this week</span>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Logo Strip                                                         */
/* ------------------------------------------------------------------ */
const LOGOS = ['Instantly', 'Clay', 'Apollo', 'Smartlead', 'n8n', 'Anthropic'];

const LogoStrip = memo(function LogoStrip({ prefersReducedMotion }) {
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={prefersReducedMotion ? {} : { delay: 2.0, duration: 0.6 }}
    >
      <p className="text-center text-[10px] uppercase tracking-[0.18em] text-gray-500 mb-5 md:mb-6">
        Trusted by the best B2B outbound teams
      </p>
      <div className="max-w-[800px] mx-auto overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-center gap-8 md:gap-12 min-w-max px-4">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="font-display font-bold text-base md:text-lg text-gray-500 select-none transition-colors duration-200 hover:text-white cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Scroll Indicator                                                    */
/* ------------------------------------------------------------------ */
const ScrollIndicator = memo(function ScrollIndicator({ prefersReducedMotion }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60" aria-hidden="true">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">Scroll</span>
      <motion.svg
        width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-500"
        animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
        transition={prefersReducedMotion ? {} : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main Hero Component - 3-Beat Emotional Journey                     */
/* ------------------------------------------------------------------ */
function Hero() {
  const { pricing } = usePricing();
  const prefersReducedMotion = useReducedMotion();
  const spotsFilled = useMemo(getSpotsFilled, []);
  const heroRef = useRef(null);
  const inView = useInView(heroRef, { once: false, margin: '-100px' });

  const [ctaHovered, setCtaHovered] = useState(false);

  // Cyan glow pulse on "5-10 sales calls/week" when scrolled into view
  const [glowActive, setGlowActive] = useState(false);
  useEffect(() => {
    if (!inView || prefersReducedMotion) return;
    setGlowActive(true);
    const t = setTimeout(() => setGlowActive(false), 1200);
    return () => clearTimeout(t);
  }, [inView, prefersReducedMotion]);

  // Motion helpers
  const fade = (delay) =>
    prefersReducedMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: 'easeOut' },
        };

  const fadeSlow = (delay) =>
    prefersReducedMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.6, ease: 'easeOut' },
        };

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden"
      style={{ background: '#0A0A0F' }}
      aria-label="Hero"
    >
      {/* ============ Background Layers ============ */}

      {/* Grid pattern - 16x16, 2% opacity */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.02,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 16px)',
        }}
      />

      {/* Radial cyan glow behind headline */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '1400px',
          height: '700px',
          background: 'radial-gradient(ellipse 1400px 700px at center top, rgba(34, 211, 238, 0.10), transparent 70%)',
        }}
      />

      {/* Particles */}
      {!prefersReducedMotion && <BackgroundParticles />}

      {/* ============ Main Content ============ */}
      <div
        className="relative max-w-[1100px] mx-auto px-4 sm:px-6 text-center"
        style={{
          paddingTop: 'clamp(80px, 12vh, 120px)',
          paddingBottom: 'clamp(60px, 8vh, 80px)',
        }}
      >
        {/* ---- BEAT 1: Pain Mirror (dim) ---- */}
        <motion.p
          {...fade(0.2)}
          className="font-body mb-7 max-w-2xl mx-auto"
          style={{
            fontWeight: 500,
            color: '#9CA3AF',
            fontSize: 'clamp(16px, 2.4vw, 28px)',
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
          }}
        >
          You sent the emails. They landed in spam.{' '}
          <span className="md:block">Your calendar stayed empty.</span>
        </motion.p>

        {/* ---- BEAT 2: Solution Release (bright) ---- */}
        <motion.h1
          {...fadeSlow(0.9)}
          className="font-display mb-5 max-w-[1100px] mx-auto"
          style={{
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            fontSize: 'clamp(26px, 5.5vw, 64px)',
          }}
        >
          <span className="text-white">
            Here's the AI outbound system that books
          </span>
          <br />
          <span
            className="inline-block"
            style={{
              color: '#22D3EE',
              textShadow: glowActive
                ? '0 0 32px rgba(34, 211, 238, 0.5)'
                : '0 0 16px rgba(34, 211, 238, 0.25)',
              transition: 'text-shadow 0.6s ease',
            }}
          >
            5-10 sales calls/week
          </span>
        </motion.h1>

        {/* ---- BEAT 3: Trust Unlock (mid-tone, italic) ---- */}
        <motion.p
          {...fade(1.5)}
          className="font-body mx-auto"
          style={{
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#D1D5DB',
            fontSize: 'clamp(16px, 2.2vw, 24px)',
            lineHeight: 1.4,
            marginBottom: '36px',
          }}
        >
          - even if your last campaigns failed.
        </motion.p>

        {/* ---- Subheading ---- */}
        <motion.p
          {...fade(1.9)}
          className="font-body max-w-[720px] mx-auto"
          style={{
            fontWeight: 400,
            color: '#9CA3AF',
            fontSize: 'clamp(15px, 1.4vw, 17px)',
            lineHeight: 1.5,
            marginBottom: '36px',
          }}
        >
          Built from sending{' '}
          <span style={{ color: '#22D3EE', fontWeight: 600 }}>1.9M+</span>{' '}
          emails in 2025. The same system used by{' '}
          <span style={{ color: '#E5E7EB' }}>Instantly.ai</span>,{' '}
          <span style={{ color: '#E5E7EB' }}>Clay</span>, and{' '}
          <span style={{ color: '#22D3EE', fontWeight: 600 }}>282+</span>{' '}
          B2B teams.
        </motion.p>

        {/* ---- Logo Strip ---- */}
        <div className="mb-10 md:mb-12">
          <LogoStrip prefersReducedMotion={prefersReducedMotion} />
        </div>

        {/* ---- CTA Button ---- */}
        <motion.div
          {...fadeSlow(2.2)}
          className="mb-4"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? {}
                : { scale: [1, 1.015, 1] }
            }
            transition={
              prefersReducedMotion
                ? {}
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            className="inline-block"
          >
            <Link
              to="/checkout"
              className="group relative inline-flex items-center justify-center gap-2.5 font-display font-bold rounded-xl px-12 py-4 md:py-5 text-[#0A0A0F] transition-all duration-300 w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22D3EE]"
              style={{
                background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                boxShadow: '0 10px 40px rgba(34, 211, 238, 0.35), 0 0 0 1px rgba(34, 211, 238, 0.4) inset',
                fontSize: 'clamp(17px, 1.6vw, 18px)',
              }}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
            >
              <span>Start Filling Your Calendar</span>
              <span className="flex items-center gap-1.5">
                <span className="text-[#0A0A0F]/50 line-through text-sm font-medium">
                  {pricing.displayOriginalPrice}
                </span>
                <span className="font-extrabold">{pricing.displayPrice}</span>
              </span>
              <HiArrowRight
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: ctaHovered ? 'translateX(4px)' : 'translateX(0)' }}
              />
            </Link>
          </motion.div>

          {/* Micro-trust line */}
          <p className="mt-4 text-[13px] text-gray-500 tracking-wide">
            <span aria-hidden="true">🔒</span> 30-day guarantee
            <span className="mx-1.5 text-gray-700" aria-hidden="true">·</span>
            <span aria-hidden="true">⚡</span> Instant access
            <span className="mx-1.5 text-gray-700" aria-hidden="true">·</span>
            <span aria-hidden="true">💳</span> One-time payment
          </p>
        </motion.div>

        {/* ---- Scarcity Bar ---- */}
        <motion.div {...fadeSlow(2.4)}>
          <ScarcityBar spotsFilled={spotsFilled} prefersReducedMotion={prefersReducedMotion} />
        </motion.div>

        {/* ---- Video below CTA ---- */}
        <motion.div
          {...fadeSlow(2.6)}
          className="mt-10 md:mt-14 relative"
        >
          <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple/20 to-gold/20 blur-2xl rounded-3xl pointer-events-none" aria-hidden="true" />
          <div className="relative">
            <HeroVideo />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator prefersReducedMotion={prefersReducedMotion} />

      {/* Section transition gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0F)' }}
      />
    </section>
  );
}

export default memo(Hero);
