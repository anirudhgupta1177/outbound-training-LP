import { useRef, useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { convertINRToUSD, formatLargeAmount } from '../../constants/pricing';

export const videoTestimonials = [
  {
    name: "Brent Baubach",
    video: "/testimonials/t1.mp4",
    quote: "Booked 14 qualified meetings in the first 3 weeks after launching the system.",
    description: "Brent went from an empty pipeline to consistent weekly bookings within 14 days of go-live — no manual prospecting, no cold calls.",
  },
  {
    name: "Parth",
    video: "/testimonials/t2.mov",
    quote: "10+ sales meetings in my first month — closed 3 new clients inside 30 days.",
    description: "Parth replaced scattered outbound with the exact sequences from the system and hit double-digit booked calls in his first 30 days.",
  },
  {
    name: "Pritham",
    video: "/testimonials/t3.mp4",
    quote: "18 booked calls in 21 days — ROI paid back in the first week.",
    description: "Pritham's book-rate went from near-zero to 18 qualified conversations in three weeks after finishing setup on his custom cold email machine.",
  },
  {
    name: "Ravi",
    video: "/testimonials/t4.mp4",
    quote: "Jumped from 2 meetings a month to 20+ in 6 weeks — outreach finally feels predictable.",
    description: "Ravi replaced manual prospecting with the automated system and 10x'd his monthly booked calls inside six weeks.",
  },
  {
    name: "CeeJay Teku",
    video: "/testimonials/t5.mp4",
    quote: "Scaled to 5,000+ prospects/month and booked 25 ideal-client meetings in 4 weeks.",
    description: "CeeJay used the infrastructure layer to 10x his outreach volume without hiring — 25 qualified meetings with ideal clients in month one.",
  },
  {
    name: "Aaron",
    video: "/testimonials/t6.mp4",
    quote: "First meeting booked on day 10 — 11 more in the next 3 weeks, fully hands-off.",
    description: "Aaron's full cold email infrastructure was live in under a week. First meeting landed on day 10, and 11 more followed over the next three weeks.",
  },
  {
    name: "Dev",
    video: "/testimonials/t7.mp4",
    quote: "Landed 9 qualified sales calls in my first 2 weeks running the sequences.",
    description: "Dev went from cold-calling burnout to 9 booked calls in fortnight one — same offer, completely rebuilt outbound.",
  },
  {
    name: "Yash",
    video: "/testimonials/t8.mp4",
    quote: "Booked 13 qualified meetings in the first 3 weeks — closed 2 deals inside month one.",
    description: "Yash ran the sequences exactly as taught and filled his calendar with ICP conversations in under a month — no ads, no cold calls.",
  },
  {
    name: "Christian",
    video: "/testimonials/t9.mp4",
    quote: "Booked 8 qualified meetings in the first 10 days — signed 2 retainers inside 30 days.",
    description: "Christian launched the playbook in a weekend and had signed deals before month one closed — no ads, no cold calls.",
  },
  {
    name: "Sami",
    video: "/testimonials/t10.mp4",
    quote: "15 sales meetings in 4 weeks — more pipeline than the previous 6 months combined.",
    description: "Sami used the infrastructure + copy framework and rebuilt outbound from scratch — result: a quarter's worth of pipeline in a single month.",
  },
  {
    name: "Ramsey",
    video: "/testimonials/t11.mp4",
    quote: "Closed $12K in new retainers within 5 weeks of turning the system on.",
    description: "Ramsey tightened the ICP and pushed volume through the sequences — five weeks later the first batch of retainers had already closed.",
  },
  {
    name: "Alankar",
    video: "/testimonials/t12.mp4",
    videoPosition: "center 20%",
    quote: "Booked 22 qualified calls in 30 days after launching the campaigns.",
    description: "Alankar went all-in on the system, hit send on week one, and finished the month with 22 qualified conversations on the calendar.",
  },
  {
    name: "Arjun",
    video: "/testimonials/t14.mp4",
    quote: "Went from 0 to 11 qualified meetings in 3 weeks — first client signed in week 4.",
    description: "Arjun had never run cold outreach before. Three weeks in, his calendar was full — and the first paying client closed shortly after.",
  },
  {
    name: "Ankit S.",
    video: "/testimonials/t15.mp4",
    quote: "16 booked calls in my first 30 days — outreach finally runs without me.",
    description: "Ankit automated the whole sending layer and booked 16 qualified calls in month one while spending his time on delivery, not prospecting.",
  },
  {
    name: "Tomas R.",
    video: "/testimonials/t16.mp4",
    quote: "7 meetings booked in the first 2 weeks — closed a $3K retainer inside 30 days.",
    description: "Tomas went live with the sequences on a Monday and had seven qualified calls on the calendar by the end of the second week.",
  },
];

export const VideoCard = memo(function VideoCard({ testimonial, compact = false }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const playBtnSize = compact ? 'w-10 h-10' : 'w-14 h-14';
  const playIconSize = compact ? 'w-4 h-4' : 'w-6 h-6';
  const overlayPad = compact ? 'p-2 pt-3' : 'p-2.5 pt-4';
  const starSize = compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
  const nameSize = compact ? 'text-[11px]' : 'text-sm';
  const bodyPad = compact ? 'p-3' : 'p-4';
  const quoteSize = compact ? 'text-[11px] mb-1.5' : 'text-sm mb-2';
  const descSize = compact ? 'text-[10px] leading-snug' : 'text-xs leading-relaxed';

  return (
    <div className="bg-dark-secondary border border-white/10 rounded-xl overflow-hidden h-full">
      {/* Video */}
      <div className="relative aspect-video cursor-pointer group" onClick={togglePlay}>
        <video
          ref={videoRef}
          src={testimonial.video}
          preload="metadata"
          playsInline
          className="w-full h-full object-cover"
          style={{ objectPosition: testimonial.videoPosition || 'center' }}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play button overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
            <div className={`${playBtnSize} rounded-full bg-gold/90 flex items-center justify-center shadow-lg shadow-gold/30 group-hover:scale-110 transition-transform`}>
              <svg className={`${playIconSize} text-dark ml-0.5`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Stars + Name overlay — fades to the card body color to avoid a visible seam */}
        <div
          className={`absolute -bottom-px left-0 right-0 ${overlayPad}`}
          style={{
            background:
              'linear-gradient(to top, #0A0A0A 0%, #0A0A0A 8%, rgba(10,10,10,0.7) 45%, rgba(10,10,10,0) 100%)',
          }}
        >
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className={`${starSize} text-gold`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className={`text-white font-bold ${nameSize}`}>{testimonial.name}</p>
        </div>
      </div>

      {/* Quote + Description */}
      <div className={bodyPad}>
        <p className={`text-white font-bold ${quoteSize}`}>"{testimonial.quote}"</p>
        <p className={`text-text-muted ${descSize}`}>{testimonial.description}</p>
      </div>
    </div>
  );
});

function Testimonials() {
  const { pricing, isIndia } = usePricing();

  const revenueAmount = isIndia ? 42000000 : convertINRToUSD(42000000);
  const revenueDisplay = formatLargeAmount(revenueAmount, pricing.currency);

  return (
    <section id="testimonials" className="py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Real Students. Real Meetings. Real Revenue."
          gradient
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {videoTestimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <VideoCard testimonial={testimonial} />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-6 md:gap-8 mt-8 md:mt-12 text-center"
        >
          <div>
            <p className="text-2xl md:text-3xl font-display font-bold gradient-text">1132+</p>
            <p className="text-text-muted text-xs md:text-sm">Active Students</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-bold gradient-text">7,847</p>
            <p className="text-text-muted text-xs md:text-sm">Meetings Booked</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-bold gradient-text">{revenueDisplay}+</p>
            <p className="text-text-muted text-xs md:text-sm">Pipeline Generated</p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Join 1132+ Students Filling Their Calendars
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default memo(Testimonials);
