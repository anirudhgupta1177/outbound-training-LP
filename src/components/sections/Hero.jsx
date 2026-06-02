import { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { HiStar, HiFire, HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { usePricing } from '../../contexts/PricingContext';
import { useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  Urgency helpers (stable across renders — recalculates only daily)  */
/* ------------------------------------------------------------------ */
const getSpotsFilled = () => {
  const now = new Date();
  const daysSinceEpoch = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
  const twoWeekCycle = daysSinceEpoch % 14;
  const baseSpots = 38;
  return Math.min(50, baseSpots + Math.floor(twoWeekCycle * (12 / 14)));
};

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration, inView, prefersReducedMotion) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || prefersReducedMotion) {
      setValue(target);
      return;
    }
    let start = 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = eased * target;
      setValue(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [inView, target, duration, prefersReducedMotion]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  Background Particles                                               */
/* ------------------------------------------------------------------ */
const PARTICLE_COUNT = 25;
const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  size: 2 + Math.random() * 3,
  delay: Math.random() * 8,
  duration: 6 + Math.random() * 8,
  opacity: 0.15 + Math.random() * 0.15,
}));

const BackgroundParticles = memo(function BackgroundParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-particle-drift"
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
      {/* inline keyframes for particle drift */}
      <style>{`
        @keyframes particle-drift {
          0% { transform: translateY(0) translateX(0); opacity: var(--tw-opacity, 0.3); }
          50% { opacity: var(--tw-opacity, 0.3); }
          100% { transform: translateY(-110vh) translateX(${Math.random() > 0.5 ? '' : '-'}30px); opacity: 0; }
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
/*  Video component with loading state + gradient border + speed badge */
/* ------------------------------------------------------------------ */
const HeroVideo = memo(function HeroVideo({ prefersReducedMotion }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative max-w-[640px] mx-auto xl:mx-0">
      {/* Gradient border frame */}
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
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
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

          {/* Speed badge overlay */}
          <div
            className="absolute top-2 right-2 md:top-3 md:right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] md:text-xs font-medium"
            style={{
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(34,211,238,0.3)',
              color: '#22D3EE',
            }}
          >
            <span style={{ textDecoration: 'line-through', opacity: 0.5, color: '#9CA3AF' }}>
              45 min
            </span>
            <span>1.2x speed</span>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Trust Pill with count-up                                           */
/* ------------------------------------------------------------------ */
const TrustPill = memo(function TrustPill({
  icon,
  value,
  suffix,
  label,
  target,
  duration,
  inView,
  prefersReducedMotion,
  index,
}) {
  const count = useCountUp(target, duration, inView, prefersReducedMotion);

  const displayValue = useMemo(() => {
    if (suffix === 'M') return `${count.toFixed(1)}M`;
    if (suffix === '/5') return `${count.toFixed(1)}/5`;
    return `${Math.floor(count)}+`;
  }, [count, suffix]);

  return (
    <motion.span
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { delay: 0.24 + index * 0.08, duration: 0.4 }}
      className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs md:text-sm transition-transform duration-200 hover:-translate-y-0.5 cursor-default max-[480px]:w-full max-[480px]:justify-center"
      style={{
        boxShadow: '0 0 20px rgba(34, 211, 238, 0.15) inset',
      }}
      role="status"
      aria-label={`${value} ${label}`}
    >
      {icon}
      <span className="tabular-nums">{displayValue}</span>
      <span className="hidden sm:inline">{label}</span>
    </motion.span>
  );
});

/* ------------------------------------------------------------------ */
/*  Scarcity Bar                                                       */
/* ------------------------------------------------------------------ */
const ScarcityBar = memo(function ScarcityBar({ spotsFilled, prefersReducedMotion }) {
  const spotsLeft = 50 - spotsFilled;
  const pct = (spotsFilled / 50) * 100;

  return (
    <div className="w-full max-w-xs mx-auto xl:mx-0 mt-4" role="status" aria-label={`${spotsFilled} of 50 spots filled`}>
      {/* Progress bar */}
      <div className="relative h-5 rounded-full overflow-hidden bg-white/5 border border-white/10">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #06B6D4, #22D3EE)',
          }}
        >
          {/* Pulse on leading edge */}
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

      {/* "Only X spots left" tag */}
      <div className="flex items-center justify-center xl:justify-start gap-1.5 mt-2 text-xs text-gray-300">
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
/*  Scroll Indicator                                                    */
/* ------------------------------------------------------------------ */
const ScrollIndicator = memo(function ScrollIndicator({ prefersReducedMotion }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-60" aria-hidden="true">
      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
        Scroll
      </span>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="text-gray-500"
        animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
        transition={prefersReducedMotion ? {} : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main Hero Component                                                */
/* ------------------------------------------------------------------ */
function Hero() {
  const { pricing } = usePricing();
  const prefersReducedMotion = useReducedMotion();
  const spotsFilled = useMemo(getSpotsFilled, []);

  // For trust pill count-up
  const trustRef = useRef(null);
  const trustInView = useInView(trustRef, { once: true, margin: '-50px' });

  // CTA hover state for arrow animation
  const [ctaHovered, setCtaHovered] = useState(false);

  // Stagger config
  const stagger = useCallback(
    (index) =>
      prefersReducedMotion
        ? {}
        : { delay: index * 0.08, duration: 0.4 },
    [prefersReducedMotion],
  );

  const fadeUp = useCallback(
    (index) =>
      prefersReducedMotion
        ? {}
        : { opacity: 0, y: 12 },
    [prefersReducedMotion],
  );

  return (
    <section
      className="relative overflow-hidden flex items-center"
      style={{ minHeight: '100vh', maxHeight: '900px' }}
      aria-label="Hero"
    >
      {/* ============ Background Layers ============ */}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.02,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 8px)',
        }}
      />

      {/* Radial cyan glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '1200px',
          height: '1200px',
          background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Purple / gold blur orbs (reduced intensity) */}
      <div
        className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(139,92,246,0.12)' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(34,211,238,0.06)' }}
        aria-hidden="true"
      />

      {/* Particles */}
      {!prefersReducedMotion && <BackgroundParticles />}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.15) 100%)',
        }}
      />

      {/* ============ Main Content ============ */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 xl:py-0">
        <div className="xl:grid xl:grid-cols-[3fr_2fr] xl:gap-8 xl:items-center">
          {/* ---------- Left Column: Video (desktop) / below headline (mobile) ---------- */}
          <div className="order-2 xl:order-1 mb-6 xl:mb-0">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(3)}
            >
              {/* Glow behind video */}
              <div className="relative">
                <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple/20 to-gold/20 blur-2xl rounded-3xl pointer-events-none" aria-hidden="true" />
                <div className="relative">
                  <HeroVideo prefersReducedMotion={prefersReducedMotion} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ---------- Right Column: Content Stack ---------- */}
          <div className="order-1 xl:order-2 text-center xl:text-left">
            {/* Logo */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(0)}
              className="mb-4 md:mb-5 relative inline-block xl:block"
            >
              {/* Faint cyan radial glow behind logo */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
                style={{
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)',
                  filter: 'blur(200px)',
                }}
              />
              <a
                href="/"
                className="relative font-display font-bold tracking-tight select-none leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold rounded"
                aria-label="IntentLedSales home"
              >
                <span className="text-white">Intent</span>
                <span className="text-gold">Led</span>
                <span className="text-white">Sales</span>
              </a>
            </motion.div>

            {/* Trust Pills */}
            <motion.div
              ref={trustRef}
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(1)}
              className="flex flex-wrap xl:flex-nowrap gap-2 md:gap-3 mb-3 md:mb-4 justify-center xl:justify-start max-[480px]:flex-col max-[480px]:items-center"
            >
              <TrustPill
                icon={<HiFire className="w-3 h-3 md:w-4 md:h-4 shrink-0" />}
                value="1132+"
                suffix="+"
                label="freelancers & agencies using this"
                target={1132}
                duration={1500}
                inView={trustInView}
                prefersReducedMotion={prefersReducedMotion}
                index={0}
              />
              <TrustPill
                icon={<HiStar className="w-3 h-3 md:w-4 md:h-4 shrink-0" />}
                value="4.9/5"
                suffix="/5"
                label="rating"
                target={4.9}
                duration={1000}
                inView={trustInView}
                prefersReducedMotion={prefersReducedMotion}
                index={1}
              />
              <TrustPill
                icon={<span className="text-sm shrink-0" aria-hidden="true">📧</span>}
                value="1.9M"
                suffix="M"
                label="Emails Sent"
                target={1.9}
                duration={1000}
                inView={trustInView}
                prefersReducedMotion={prefersReducedMotion}
                index={2}
              />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(2)}
              className="font-display mb-2 md:mb-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl"
              style={{ lineHeight: '1.08', letterSpacing: '-0.025em' }}
            >
              <span className="text-white font-normal">How To Book </span>
              <span className="gradient-text font-extrabold">5-10 Sales Calls/Week</span>
              <br className="hidden md:block" />
              <span className="text-white font-semibold"> By Installing This AI Outbound Funnel </span>
              <br className="hidden lg:block" />
              <span className="text-white/80 font-normal">(used by top 0.1% marketing teams like Instantly)</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(2.5)}
              className="text-gray-400 mb-4 md:mb-5 max-w-lg mx-auto xl:mx-0 font-body"
              style={{ fontSize: 'clamp(15px, 1.6vw, 17px)' }}
            >
              Built from sending 1.9M+ emails in 2025 — now simplified into a system you can implement in days.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(4)}
              className="mb-3"
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
                  className="group relative inline-flex items-center justify-center gap-2 font-display font-bold rounded-xl text-sm md:text-base px-6 md:px-8 py-3 md:py-4 text-[#0A0A0F] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  style={{
                    background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                    boxShadow:
                      '0 10px 40px rgba(34, 211, 238, 0.35), 0 0 0 1px rgba(34, 211, 238, 0.5) inset',
                  }}
                  onMouseEnter={() => setCtaHovered(true)}
                  onMouseLeave={() => setCtaHovered(false)}
                  onFocus={() => setCtaHovered(true)}
                  onBlur={() => setCtaHovered(false)}
                >
                  <span>Start Filling Your Calendar</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[#0A0A0F]/60 line-through text-xs md:text-sm font-medium">
                      {pricing.displayOriginalPrice}
                    </span>
                    <span className="font-extrabold">{pricing.displayPrice}</span>
                  </span>
                  <HiArrowRight
                    className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-200"
                    style={{
                      transform: ctaHovered ? 'translateX(4px)' : 'translateX(0)',
                    }}
                  />
                </Link>
              </motion.div>

              {/* Micro-trust line */}
              <p className="mt-2.5 text-[11px] md:text-xs text-gray-500 tracking-wide">
                <span aria-hidden="true">🔒</span> 30-day guarantee{' '}
                <span className="mx-1 text-gray-700" aria-hidden="true">·</span>{' '}
                <span aria-hidden="true">⚡</span> Instant access{' '}
                <span className="mx-1 text-gray-700" aria-hidden="true">·</span>{' '}
                <span aria-hidden="true">💳</span> One-time payment
              </p>
            </motion.div>

            {/* Scarcity Bar */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={stagger(5)}
            >
              <ScarcityBar spotsFilled={spotsFilled} prefersReducedMotion={prefersReducedMotion} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator prefersReducedMotion={prefersReducedMotion} />

      {/* Section transition gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(to bottom, transparent, #0A0A0F)',
        }}
      />
    </section>
  );
}

export default memo(Hero);
