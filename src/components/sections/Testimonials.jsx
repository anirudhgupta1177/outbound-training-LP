import { useRef, useState, useEffect, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { convertINRToUSD, formatLargeAmount } from '../../constants/pricing';

/* ------------------------------------------------------------------ */
/*  Testimonial data                                                   */
/* ------------------------------------------------------------------ */
export const videoTestimonials = [
  {
    name: "Brent Baubach",
    tag: "saas",
    video: "/testimonials/t1.mp4",
    quote: "Booked 14 qualified meetings in the first 3 weeks after launching the system.",
    description: "Brent went from an empty pipeline to consistent weekly bookings within 14 days of go-live — no manual prospecting, no cold calls.",
  },
  {
    name: "Parth",
    tag: "agencies",
    video: "/testimonials/t2.mov",
    quote: "10+ sales meetings in my first month — closed 3 new clients inside 30 days.",
    description: "Parth replaced scattered outbound with the exact sequences from the system and hit double-digit booked calls in his first 30 days.",
  },
  {
    name: "Pritham",
    tag: "consultants",
    video: "/testimonials/t3.mp4",
    quote: "18 booked calls in 21 days — ROI paid back in the first week.",
    description: "Pritham's book-rate went from near-zero to 18 qualified conversations in three weeks after finishing setup on his custom cold email machine.",
  },
  {
    name: "Ravi",
    tag: "agencies",
    video: "/testimonials/t4.mp4",
    quote: "Jumped from 2 meetings a month to 20+ in 6 weeks — outreach finally feels predictable.",
    description: "Ravi replaced manual prospecting with the automated system and 10x'd his monthly booked calls inside six weeks.",
  },
  {
    name: "CeeJay Teku",
    tag: "freelancers",
    video: "/testimonials/t5.mp4",
    quote: "Scaled to 5,000+ prospects/month and booked 25 ideal-client meetings in 4 weeks.",
    description: "CeeJay used the infrastructure layer to 10x his outreach volume without hiring — 25 qualified meetings with ideal clients in month one.",
  },
  {
    name: "Aaron",
    tag: "saas",
    video: "/testimonials/t6.mp4",
    quote: "First meeting booked on day 10 — 11 more in the next 3 weeks, fully hands-off.",
    description: "Aaron's full cold email infrastructure was live in under a week. First meeting landed on day 10, and 11 more followed over the next three weeks.",
  },
  {
    name: "Dev",
    tag: "freelancers",
    video: "/testimonials/t7.mp4",
    quote: "Landed 9 qualified sales calls in my first 2 weeks running the sequences.",
    description: "Dev went from cold-calling burnout to 9 booked calls in fortnight one — same offer, completely rebuilt outbound.",
  },
  {
    name: "Yash",
    tag: "agencies",
    video: "/testimonials/t8.mp4",
    quote: "Booked 13 qualified meetings in the first 3 weeks — closed 2 deals inside month one.",
    description: "Yash ran the sequences exactly as taught and filled his calendar with ICP conversations in under a month — no ads, no cold calls.",
  },
  {
    name: "Christian",
    tag: "consultants",
    video: "/testimonials/t9.mp4",
    quote: "Booked 8 qualified meetings in the first 10 days — signed 2 retainers inside 30 days.",
    description: "Christian launched the playbook in a weekend and had signed deals before month one closed — no ads, no cold calls.",
  },
  {
    name: "Sami",
    tag: "saas",
    video: "/testimonials/t10.mp4",
    quote: "15 sales meetings in 4 weeks — more pipeline than the previous 6 months combined.",
    description: "Sami used the infrastructure + copy framework and rebuilt outbound from scratch — result: a quarter's worth of pipeline in a single month.",
  },
  {
    name: "Ramsey",
    tag: "ecommerce",
    video: "/testimonials/t11.mp4",
    quote: "Closed $12K in new retainers within 5 weeks of turning the system on.",
    description: "Ramsey tightened the ICP and pushed volume through the sequences — five weeks later the first batch of retainers had already closed.",
  },
  {
    name: "Alankar",
    tag: "agencies",
    video: "/testimonials/t12.mp4",
    videoPosition: "center 20%",
    quote: "Booked 22 qualified calls in 30 days after launching the campaigns.",
    description: "Alankar went all-in on the system, hit send on week one, and finished the month with 22 qualified conversations on the calendar.",
  },
  {
    name: "Arjun",
    tag: "freelancers",
    video: "/testimonials/t14.mp4",
    quote: "Went from 0 to 11 qualified meetings in 3 weeks — first client signed in week 4.",
    description: "Arjun had never run cold outreach before. Three weeks in, his calendar was full — and the first paying client closed shortly after.",
  },
  {
    name: "Ankit S.",
    tag: "consultants",
    video: "/testimonials/t15.mp4",
    quote: "16 booked calls in my first 30 days — outreach finally runs without me.",
    description: "Ankit automated the whole sending layer and booked 16 qualified calls in month one while spending his time on delivery, not prospecting.",
  },
  {
    name: "Tomas R.",
    tag: "saas",
    video: "/testimonials/t16.mp4",
    quote: "7 meetings booked in the first 2 weeks — closed a $3K retainer inside 30 days.",
    description: "Tomas went live with the sequences on a Monday and had seven qualified calls on the calendar by the end of the second week.",
  },
];

const FILTER_PILLS = [
  { label: 'All', value: 'all' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Agencies', value: 'agencies' },
  { label: 'Consultants', value: 'consultants' },
  { label: 'Freelancers', value: 'freelancers' },
  { label: 'E-commerce', value: 'ecommerce' },
];

/* ------------------------------------------------------------------ */
/*  Count-up hook                                                      */
/* ------------------------------------------------------------------ */
function useCountUp(target, duration, inView, reduced) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView || reduced) { setValue(target); return; }
    const startTime = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration, reduced]);
  return value;
}

/* ------------------------------------------------------------------ */
/*  Stat Card (for aggregate strip)                                    */
/* ------------------------------------------------------------------ */
const StatCard = memo(function StatCard({ target, suffix, label, duration, inView, reduced }) {
  const count = useCountUp(target, duration, inView, reduced);
  const display = useMemo(() => {
    if (suffix === 'Cr+') return `₹${count.toFixed(1)}Cr+`;
    if (suffix === '+') return `${Math.floor(count).toLocaleString('en-IN')}+`;
    return Math.floor(count).toLocaleString('en-IN');
  }, [count, suffix]);

  return (
    <div className="flex-1 text-center px-2">
      <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text leading-none">
        {display}
      </p>
      <p className="text-text-muted text-[10px] sm:text-xs md:text-sm mt-1">{label}</p>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Compact Testimonial Card (mobile carousel + desktop grid)          */
/* ------------------------------------------------------------------ */
const CompactCard = memo(function CompactCard({ testimonial, onPlay, isNearActive }) {
  return (
    <div
      className="bg-dark-secondary rounded-xl overflow-hidden h-full flex flex-col"
      style={{
        border: '1px solid rgba(34, 211, 238, 0.2)',
      }}
    >
      {/* Video thumbnail — 16:9 */}
      <div
        className="relative cursor-pointer group"
        style={{ aspectRatio: '16/9' }}
        onClick={() => onPlay(testimonial)}
      >
        {isNearActive ? (
          <video
            src={testimonial.video}
            preload="metadata"
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ objectPosition: testimonial.videoPosition || 'center' }}
          />
        ) : (
          <div className="w-full h-full bg-dark-tertiary" />
        )}

        {/* Play button */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg shadow-gold/30 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-dark ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        {/* Stars */}
        <div className="flex gap-0.5 mb-1.5">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-3 h-3 text-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Name */}
        <p className="text-white text-sm font-medium mb-1.5">{testimonial.name}</p>

        {/* Quote */}
        <p className="text-white text-[15px] md:text-[17px] leading-[1.4] font-semibold mb-1.5 line-clamp-3">
          "{testimonial.quote}"
        </p>

        {/* Description */}
        <p className="text-gray-400 text-[13px] leading-snug line-clamp-2 mt-auto">
          {testimonial.description}
        </p>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Full-screen Video Modal                                            */
/* ------------------------------------------------------------------ */
const VideoModal = memo(function VideoModal({ testimonial, onClose }) {
  const videoRef = useRef(null);

  useEffect(() => {
    // Autoplay on open
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
    // Lock body scroll
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 z-10"
          aria-label="Close video"
        >
          <HiX className="w-8 h-8" />
        </button>

        <div className="rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={testimonial.video}
            controls
            playsInline
            className="w-full"
            style={{ objectPosition: testimonial.videoPosition || 'center' }}
          />
        </div>

        <div className="mt-3 px-1">
          <p className="text-white font-bold text-lg">{testimonial.name}</p>
          <p className="text-white/80 text-sm mt-1">"{testimonial.quote}"</p>
        </div>
      </motion.div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  All Stories Modal (vertical stack)                                  */
/* ------------------------------------------------------------------ */
const AllStoriesModal = memo(function AllStoriesModal({ testimonials, onClose, onPlay }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] bg-dark/95 overflow-y-auto"
    >
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-dark/95 backdrop-blur-lg py-3 z-10">
          <h3 className="text-white font-display font-bold text-lg">All {testimonials.length} Stories</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2"
            aria-label="Close"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <CompactCard key={i} testimonial={t} onPlay={onPlay} isNearActive />
          ))}
        </div>
      </div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/*  Carousel Dots                                                      */
/* ------------------------------------------------------------------ */
const CarouselDots = memo(function CarouselDots({ total, active }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 24 : 6,
            height: 6,
            backgroundColor: i === active ? '#22D3EE' : '#4B5563',
          }}
        />
      ))}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main Testimonials Component                                        */
/* ------------------------------------------------------------------ */
function Testimonials() {
  const { pricing, isIndia } = usePricing();
  const prefersReducedMotion = useReducedMotion();

  // Stats
  const revenueAmount = isIndia ? 42000000 : convertINRToUSD(42000000);
  const revenueDisplay = formatLargeAmount(revenueAmount, pricing.currency);

  // Refs & state
  const statsRef = useRef(null);
  const carouselRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-50px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');
  const [videoModal, setVideoModal] = useState(null);
  const [allStoriesModal, setAllStoriesModal] = useState(false);

  // Filtered testimonials
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return videoTestimonials;
    return videoTestimonials.filter(t => t.tag === activeFilter);
  }, [activeFilter]);

  // Reset carousel when filter changes
  useEffect(() => {
    setActiveIndex(0);
    if (carouselRef.current) {
      carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [activeFilter]);

  // Track active card via scroll position
  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth || 300;
    const gap = 16;
    const idx = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(idx, filtered.length - 1));
  }, [filtered.length]);

  // Arrow navigation
  const scrollTo = useCallback((direction) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.firstElementChild?.offsetWidth || 300;
    const gap = 16;
    const newIndex = direction === 'next'
      ? Math.min(activeIndex + 1, filtered.length - 1)
      : Math.max(activeIndex - 1, 0);
    el.scrollTo({ left: newIndex * (cardWidth + gap), behavior: 'smooth' });
    setActiveIndex(newIndex);
  }, [activeIndex, filtered.length]);

  const openVideo = useCallback((t) => setVideoModal(t), []);
  const closeVideo = useCallback(() => setVideoModal(null), []);

  return (
    <section id="testimonials" className="py-8 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Real Students. Real Meetings. Real Revenue."
          gradient
        />

        {/* ============================================================ */}
        {/*  Block 1 — Aggregate Proof Strip                              */}
        {/* ============================================================ */}
        <div
          ref={statsRef}
          className="mt-6 md:mt-10 mx-auto max-w-xl md:max-w-3xl rounded-xl py-5 px-3"
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(34,211,238,0.02) 100%)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}
        >
          <div className="flex items-center justify-center divide-x divide-white/10">
            <StatCard
              target={1132}
              suffix="+"
              label="Students"
              duration={1500}
              inView={statsInView}
              reduced={prefersReducedMotion}
            />
            <StatCard
              target={7847}
              suffix=""
              label="Meetings Booked"
              duration={1500}
              inView={statsInView}
              reduced={prefersReducedMotion}
            />
            {isIndia ? (
              <StatCard
                target={4.2}
                suffix="Cr+"
                label="Pipeline Generated"
                duration={1200}
                inView={statsInView}
                reduced={prefersReducedMotion}
              />
            ) : (
              <div className="flex-1 text-center px-2">
                <p className="text-xl sm:text-2xl md:text-3xl font-display font-bold gradient-text leading-none">
                  {revenueDisplay}+
                </p>
                <p className="text-text-muted text-[10px] sm:text-xs md:text-sm mt-1">Pipeline Generated</p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  Block 4 — Filter Pills                                       */}
        {/* ============================================================ */}
        <div className="mt-5 md:mt-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 md:justify-center min-w-max px-1 pb-1">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.value}
                onClick={() => setActiveFilter(pill.value)}
                className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFilter === pill.value
                    ? 'bg-gold/20 text-gold border border-gold/40'
                    : 'bg-white/5 text-text-muted border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  Block 2 — MOBILE: Horizontal Snap Carousel                   */}
        {/* ============================================================ */}
        <div className="md:hidden mt-5">
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            style={{ paddingLeft: '7.5vw', paddingRight: '7.5vw' }}
          >
            {filtered.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${index}`}
                className="flex-shrink-0 snap-center"
                style={{ width: '85vw', maxWidth: 380 }}
              >
                <CompactCard
                  testimonial={testimonial}
                  onPlay={openVideo}
                  isNearActive={Math.abs(index - activeIndex) <= 1}
                />
              </div>
            ))}
          </div>

          {/* Block 3 — Carousel Controls */}
          <div className="mt-4 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollTo('prev')}
                disabled={activeIndex === 0}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-all"
                aria-label="Previous testimonial"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollTo('next')}
                disabled={activeIndex === filtered.length - 1}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white disabled:opacity-30 transition-all"
                aria-label="Next testimonial"
              >
                <HiChevronRight className="w-5 h-5" />
              </button>
            </div>

            <CarouselDots total={filtered.length} active={activeIndex} />

            <span className="text-text-muted text-xs tabular-nums">
              {activeIndex + 1} / {filtered.length}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  Block 2 — DESKTOP: 3-column grid                             */}
        {/* ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="hidden md:grid mt-8 md:mt-10 grid-cols-3 gap-5"
        >
          {filtered.map((testimonial, index) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <CompactCard
                testimonial={testimonial}
                onPlay={openVideo}
                isNearActive
              />
            </motion.div>
          ))}
        </motion.div>

        {/* ============================================================ */}
        {/*  Block 5 — "See all stories" CTA (mobile only)                */}
        {/* ============================================================ */}
        <div className="md:hidden mt-5 text-center">
          <button
            onClick={() => setAllStoriesModal(true)}
            className="text-gold text-sm font-medium underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-colors"
          >
            See all {videoTestimonials.length} stories →
          </button>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Join 1132+ Students Filling Their Calendars
          </Button>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/*  Modals                                                        */}
      {/* ============================================================ */}
      <AnimatePresence>
        {videoModal && (
          <VideoModal testimonial={videoModal} onClose={closeVideo} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allStoriesModal && (
          <AllStoriesModal
            testimonials={videoTestimonials}
            onClose={() => setAllStoriesModal(false)}
            onPlay={openVideo}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default memo(Testimonials);

/* Re-export VideoCard for backward compat with any other importers */
export const VideoCard = CompactCard;
