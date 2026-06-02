import { memo, useState, useEffect, useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { usePricing } from '../../contexts/PricingContext';

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
/*  Background Particles                                               */
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
        .animate-particle-drift { animation: particle-drift linear infinite; }
      `}</style>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Scarcity Bar (no pseudo-elements, no list markers)                 */
/* ------------------------------------------------------------------ */
const ScarcityBar = memo(function ScarcityBar({ spotsFilled, prefersReducedMotion }) {
  const spotsLeft = 50 - spotsFilled;
  const pct = (spotsFilled / 50) * 100;

  return (
    <div
      className="w-full max-w-xs mx-auto"
      role="status"
      aria-label={`${spotsFilled} of 50 spots filled`}
      style={{ listStyle: 'none' }}
    >
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
/*  Logo Strip - mobile-safe with scroll-snap + fade mask              */
/* ------------------------------------------------------------------ */
const LOGOS = ['Instantly', 'Clay', 'Apollo', 'Smartlead', 'n8n', 'Anthropic'];

const LogoStrip = memo(function LogoStrip({ prefersReducedMotion }) {
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0 }}
      animate={prefersReducedMotion ? {} : { opacity: 1 }}
      transition={prefersReducedMotion ? {} : { delay: 2.0, duration: 0.6 }}
    >
      <p
        className="text-center uppercase text-gray-500"
        style={{ fontSize: '10px', letterSpacing: '0.18em', marginBottom: '16px' }}
      >
        Trusted by the best B2B outbound teams
      </p>
      <div
        className="logo-strip-container mx-auto"
        style={{ maxWidth: '700px' }}
      >
        <div className="logo-strip flex items-center justify-center gap-8 md:gap-12 px-6">
          {LOGOS.map((name) => (
            <span
              key={name}
              className="font-display font-bold text-sm md:text-base text-gray-500 select-none transition-colors duration-200 hover:text-white cursor-default flex-shrink-0"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Mobile logo strip: scroll-snap + fade mask */}
      <style>{`
        @media (max-width: 768px) {
          .logo-strip {
            justify-content: flex-start;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 32px;
            padding: 0 24px;
            scrollbar-width: none;
            -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          }
          .logo-strip::-webkit-scrollbar { display: none; }
          .logo-strip > * { scroll-snap-align: center; flex-shrink: 0; }
        }
      `}</style>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main Hero Component - 3-Beat Emotional Journey                     */
/*  All copy UNCHANGED. Only typography sizes, spacing, layout fixed.  */
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
      className="hero-section relative overflow-hidden"
      style={{ background: '#0A0A0F' }}
      aria-label="Hero"
    >
      {/* ============ Background Layers ============ */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          opacity: 0.02,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 16px), repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, transparent 1px, transparent 16px)',
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        aria-hidden="true"
        style={{
          width: '1400px',
          height: '700px',
          background: 'radial-gradient(ellipse 1400px 700px at center top, rgba(34, 211, 238, 0.10), transparent 70%)',
        }}
      />
      {!prefersReducedMotion && <BackgroundParticles />}

      {/* ============ Main Content ============ */}
      {/* Desktop: 80px top / 48px bottom. Mobile: 32px / 32px. Max 900px total height on desktop. */}
      <div
        className="relative max-w-[1100px] mx-auto px-4 sm:px-6 text-center"
        style={{ paddingTop: '80px', paddingBottom: '48px' }}
      >
        {/* ---- BEAT 1: Pain Mirror (dim) ---- */}
        {/* Desktop: 22px, Mobile: 15px */}
        <motion.p
          {...fade(0.2)}
          className="beat-1 font-body mx-auto"
          style={{
            fontWeight: 500,
            color: '#9CA3AF',
            fontSize: '22px',
            lineHeight: 1.45,
            letterSpacing: '-0.01em',
            maxWidth: '720px',
            marginBottom: '32px',
          }}
        >
          You sent the emails. They landed in spam.{' '}
          <span className="md:block">Your calendar stayed empty.</span>
        </motion.p>

        {/* ---- BEAT 2: Solution Release (bright) ---- */}
        {/* Desktop: 56px HARD-CODED, Mobile: 32px HARD-CODED */}
        <motion.h1
          {...fadeSlow(0.9)}
          className="beat-2 font-display mx-auto"
          style={{
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.025em',
            fontSize: '56px',
            maxWidth: '880px',
            marginBottom: '16px',
          }}
        >
          <span className="block text-white">
            Here's the AI outbound system that books
          </span>
          <span
            className="block"
            style={{
              color: '#22D3EE',
              marginTop: '4px',
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
        {/* Desktop: 20px, Mobile: 15px */}
        <motion.p
          {...fade(1.5)}
          className="beat-3 font-body mx-auto"
          style={{
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#D1D5DB',
            fontSize: '20px',
            lineHeight: 1.4,
            marginTop: '24px',
            marginBottom: '32px',
          }}
        >
          - even if your last campaigns failed.
        </motion.p>

        {/* ---- Subheading ---- */}
        {/* Desktop: 16px, Mobile: 14px */}
        <motion.p
          {...fade(1.9)}
          className="hero-subheading font-body mx-auto"
          style={{
            fontWeight: 400,
            color: '#9CA3AF',
            fontSize: '16px',
            lineHeight: 1.55,
            maxWidth: '640px',
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
        {/* Logos -> CTA: 32px desktop / 24px mobile */}
        <div style={{ marginBottom: '32px' }}>
          <LogoStrip prefersReducedMotion={prefersReducedMotion} />
        </div>

        {/* ---- CTA Button ---- */}
        <motion.div {...fadeSlow(2.2)}>
          <motion.div
            animate={prefersReducedMotion ? {} : { scale: [1, 1.015, 1] }}
            transition={prefersReducedMotion ? {} : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-block"
          >
            <Link
              to="/checkout"
              className="group relative inline-flex items-center justify-center gap-2.5 font-display font-bold rounded-xl px-10 py-4 text-[#0A0A0F] transition-all duration-300 w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#22D3EE]"
              style={{
                background: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
                boxShadow: '0 10px 40px rgba(34, 211, 238, 0.35), 0 0 0 1px rgba(34, 211, 238, 0.4) inset',
                fontSize: '18px',
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

          {/* Micro-trust line - 16px below CTA */}
          <p className="text-[13px] text-gray-500 tracking-wide" style={{ marginTop: '16px' }}>
            <span aria-hidden="true">🔒</span> 30-day guarantee
            <span className="mx-1.5 text-gray-700" aria-hidden="true">·</span>
            <span aria-hidden="true">⚡</span> Instant access
            <span className="mx-1.5 text-gray-700" aria-hidden="true">·</span>
            <span aria-hidden="true">💳</span> One-time payment
          </p>

          {/* Scarcity Bar - 16px below trust line */}
          <div style={{ marginTop: '16px' }}>
            <ScarcityBar spotsFilled={spotsFilled} prefersReducedMotion={prefersReducedMotion} />
          </div>
        </motion.div>
      </div>

      {/* ============ Mobile overrides ============ */}
      <style>{`
        @media (max-width: 767px) {
          .hero-section { padding-top: 0 !important; padding-bottom: 0 !important; }
          .hero-section > div:not([aria-hidden]) { padding-top: 32px !important; padding-bottom: 32px !important; }
          .hero-section::before { content: none !important; }

          .beat-1 { font-size: 15px !important; line-height: 1.5 !important; padding: 0 20px; margin-bottom: 20px !important; }
          .beat-2 { font-size: 32px !important; line-height: 1.1 !important; padding: 0 16px; margin-bottom: 12px !important; }
          .beat-3 { font-size: 15px !important; padding: 0 24px; margin-top: 18px !important; margin-bottom: 22px !important; }
          .hero-subheading { font-size: 14px !important; padding: 0 24px; margin-bottom: 28px !important; }
        }

        /* Scarcity bar artifact fix */
        .hero-section [role="status"]::before { content: none !important; }
        .hero-section [role="status"] { list-style: none !important; }
      `}</style>

      {/* Section transition gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[80px] pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, transparent, #0A0A0F)' }}
      />
    </section>
  );
}

export default memo(Hero);
