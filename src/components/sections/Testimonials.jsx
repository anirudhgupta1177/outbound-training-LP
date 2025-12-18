import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { SectionHeading, Button } from '../ui';

// Import testimonial images
import testimonial1 from '../../assets/testimonials/testimonial1.png';
import testimonial2 from '../../assets/testimonials/testimonial2.png';
import testimonial3 from '../../assets/testimonials/testimonial3.png';
import testimonial4 from '../../assets/testimonials/testimonial4.png';
import testimonial5 from '../../assets/testimonials/testimonial5.png';
import testimonial6 from '../../assets/testimonials/testimonial6.png';

const testimonials = [
  { image: testimonial1 },
  { image: testimonial2 },
  { image: testimonial3 },
  { image: testimonial4 },
  { image: testimonial5 },
  { image: testimonial6 },
];

export default function Testimonials() {
  const swiperRef = useRef(null);
  const sectionRef = useRef(null);
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
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="1132+ Freelancers & Agencies Are Filling Their Calendars With This System"
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
              delay: 2500,
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
            className="pb-12 md:pb-16"
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass-card rounded-xl md:rounded-2xl overflow-hidden h-full"
                >
                  {/* Screenshot image - shows full testimonial from screenshot */}
                  <div className="aspect-[4/3] bg-dark-tertiary overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt="Student testimonial"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom navigation and pagination */}
          <div className="flex items-center justify-center gap-4 mt-2 md:mt-4">
            <button className="testimonial-prev w-8 h-8 md:w-10 md:h-10 rounded-full border border-purple/30 flex items-center justify-center text-text-secondary hover:text-gold hover:border-gold transition-colors">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="testimonial-pagination flex gap-2" />
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
            <p className="text-2xl md:text-3xl font-display font-bold gradient-text">2,847</p>
            <p className="text-text-muted text-xs md:text-sm">Meetings Booked</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-display font-bold gradient-text">₹4.2Cr+</p>
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
            Join 1132+ Students Today
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
