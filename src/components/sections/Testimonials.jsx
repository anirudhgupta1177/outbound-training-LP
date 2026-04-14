import { useRef, useEffect, useState, memo, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { formatPrice, convertINRToUSD, formatLargeAmount } from '../../constants/pricing';

const videoTestimonials = [
  {
    name: "Brent Baubach",
    video: "/testimonials/brent.mp4",
    quote: "The system just works — I'm booking meetings every week now.",
    description: "Brent saw results within the first 14 days of launching his cold email machine. Pipeline grew consistently from day one.",
  },
  {
    name: "Parth",
    video: "/testimonials/Parth.mp4",
    quote: "The results speak for themselves — highly recommended.",
    description: "Parth shares his direct experience with the system and how it streamlined his outbound operation for maximum efficiency.",
  },
  {
    name: "Pritham",
    video: "/testimonials/Pritham.mp4",
    quote: "Incredible ROI and a perfect setup process.",
    description: "Pritham shows the positive results and book-rate increase since launching his custom cold email machine.",
  },
  {
    name: "Ravi",
    video: "/testimonials/ravi.mp4",
    quote: "I wish I had found this sooner — it changed my outreach game.",
    description: "Went from struggling with manual outreach to a fully automated system that consistently books qualified meetings.",
  },
  {
    name: "CeeJay Teku",
    video: "/testimonials/ceejay.mp4",
    quote: "It's really unlimited to how many people we can reach out to.",
    description: "CeeJay scaled his outbound outreach rapidly and started booking calls with ideal clients across multiple industries.",
  },
  {
    name: "Aaron",
    video: "/testimonials/aaron.mp4",
    quote: "The setup was seamless — I didn't have to touch a thing.",
    description: "Aaron's entire cold email infrastructure was built in under a week, and he booked his first meeting within 10 days.",
  },
];

const VideoCard = memo(function VideoCard({ testimonial }) {
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
          onEnded={() => setIsPlaying(false)}
        />

        {/* Play button overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-lg shadow-gold/30 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-dark ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Stars + Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
          <div className="flex gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-white font-bold text-sm">{testimonial.name}</p>
        </div>
      </div>

      {/* Quote + Description */}
      <div className="p-4">
        <p className="text-white font-bold text-sm mb-2">"{testimonial.quote}"</p>
        <p className="text-text-muted text-xs leading-relaxed">{testimonial.description}</p>
      </div>
    </div>
  );
});

function Testimonials() {
  const { pricing, isIndia } = usePricing();
  const swiperRef = useRef(null);
  const sectionRef = useRef(null);

  const revenueAmount = isIndia ? 42000000 : convertINRToUSD(42000000);
  const revenueDisplay = formatLargeAmount(revenueAmount, pricing.currency);
  const isInView = useInView(sectionRef, { once: false, margin: '-100px' });

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (isInView) {
        swiperRef.current.swiper.autoplay.start();
      } else {
        swiperRef.current.swiper.autoplay.stop();
      }
    }
  }, [isInView]);

  return (
    <section id="testimonials" ref={sectionRef} className="py-12 md:py-20 relative overflow-hidden">
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
          className="mt-8 md:mt-12"
        >
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={16}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            pagination={{
              clickable: true,
              el: '.testimonial-pagination',
            }}
            navigation={{
              prevEl: '.testimonial-prev',
              nextEl: '.testimonial-next',
            }}
            breakpoints={{
              480: { slidesPerView: 1.5, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            className="pb-12 md:pb-16 testimonials-swiper"
          >
            {videoTestimonials.map((testimonial, index) => (
              <SwiperSlide key={index} className="!flex items-center justify-center !h-auto">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="w-full h-full"
                >
                  <VideoCard testimonial={testimonial} />
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Navigation and pagination */}
          <div className="flex items-center justify-center gap-4 mt-2 md:mt-4">
            <button className="testimonial-prev w-8 h-8 md:w-10 md:h-10 rounded-full border border-purple/30 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="testimonial-pagination flex gap-2 justify-center items-center" style={{ width: 'auto', minWidth: '120px' }} />
            <button className="testimonial-next w-8 h-8 md:w-10 md:h-10 rounded-full border border-purple/30 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
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
