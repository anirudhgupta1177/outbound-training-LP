import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { SectionHeading, MacBookFrame, Button } from '../ui';

// Import BIG resolution screenshots (Global Analytics)
import big1 from '../../assets/social-proof-big/big1.png';
import big2 from '../../assets/social-proof-big/big2.png';

// Import SMALL resolution screenshots (Campaign Stats)
import small1 from '../../assets/social-proof-small/small1.png';
import small2 from '../../assets/social-proof-small/small2.png';
import small3 from '../../assets/social-proof-small/small3.png';
import small4 from '../../assets/social-proof-small/small4.png';
import small5 from '../../assets/social-proof-small/small5.png';
import small6 from '../../assets/social-proof-small/small6.png';

const bigDashboards = [
  { image: big1, caption: '247.8K emails → 918 opportunities → $468K pipeline in 6 months' },
  { image: big2, caption: '3.17M emails sent → 39K replies → 7,662 hot prospects at scale' },
];

const smallDashboards = [
  { image: small1, caption: '85.8% open, 26.5% reply - 11X average' },
  { image: small2, caption: '59.2% open from 46.2K emails' },
  { image: small3, caption: '88% open → 40 opportunities' },
  { image: small4, caption: '33.2% reply - Intent targeting works' },
  { image: small5, caption: '9% conversion, 99% health score' },
  { image: small6, caption: '33K emails → 451 replies' },
];

export default function DashboardShowcase() {
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
    <section id="proof" ref={sectionRef} className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-purple/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="These Numbers Don't Lie. This Could Be Your Dashboard in 30 Days."
          subtitle="Real results from real campaigns - this is what your dashboard will look like"
          gradient
        />

        {/* BIG Resolution Section - Global Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-8 md:mt-12"
        >
          <h3 className="text-lg md:text-xl font-display font-bold text-white text-center mb-6 md:mb-8">
            Global Analytics Dashboard
          </h3>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {bigDashboards.map((dashboard, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <MacBookFrame caption={dashboard.caption}>
                  <div className="w-full aspect-[16/10] bg-dark-tertiary overflow-hidden">
                    <img
                      src={dashboard.image}
                      alt={dashboard.caption}
                      className="w-full h-full object-contain bg-white"
                      loading="lazy"
                    />
                  </div>
                </MacBookFrame>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SMALL Resolution Section - Campaign Stats Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 md:mt-16"
        >
          <h3 className="text-lg md:text-xl font-display font-bold text-white text-center mb-6 md:mb-8">
            Campaign Performance Snapshots
          </h3>
          <Swiper
            ref={swiperRef}
            modules={[Autoplay, EffectCoverflow]}
            effect="coverflow"
            grabCursor
            centeredSlides
            slidesPerView="auto"
            loop={true}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            speed={800}
            breakpoints={{
              320: { slidesPerView: 1.2 },
              480: { slidesPerView: 1.5 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 2.5 },
            }}
            className="pb-6 md:pb-8"
          >
            {smallDashboards.map((dashboard, index) => (
              <SwiperSlide key={index} className="!w-[350px] md:!w-[450px] max-w-[90vw]">
                <div className="w-full">
                  <div className="w-full bg-dark-tertiary rounded-lg overflow-hidden mb-4 border-2 border-white/20">
                    <img
                      src={dashboard.image}
                      alt={dashboard.caption}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-center text-text-secondary text-xs md:text-sm font-medium">
                    {dashboard.caption}
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* Stats badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8 md:mt-12"
        >
          {[
            { value: '1000+', label: 'Emails Daily', sub: '(Fully Automated)' },
            { value: '23%', label: 'Average Reply Rate', sub: '(Industry Avg: 3%)' },
            { value: '30+', label: 'Meetings/Month', sub: '(After 30 days)' },
            { value: '$10K+', label: 'Revenue', sub: '(In Pipeline)' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="glass-card px-4 md:px-6 py-3 md:py-4 rounded-xl text-center min-w-[120px] md:min-w-[140px]"
            >
              <p className="text-xl md:text-2xl font-display font-bold gradient-text">{stat.value}</p>
              <p className="text-white text-xs md:text-sm font-medium">{stat.label}</p>
              <p className="text-text-muted text-xs">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            I want these Results
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
