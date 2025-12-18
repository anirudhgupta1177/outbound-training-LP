import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlay, HiCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const credentials = [
  'Heading Outbound for Instantly AI (one of the biggest outbound companies) — sending 60K emails/day for them',
  'Studied from IIT Kharagpur',
  'Sent 1.9M Emails in 2025 and generated over ₹2.45 CR in direct Revenue',
  'Booked calls with billionaires like Sam Altman from Cold Emails',
  'Run a community of over 1132+ cold emailers',
];

export default function Instructor() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.2;
    }
  }, []);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.2;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section id="instructor" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-gold/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Built By Someone Who Actually Does This Daily"
          subtitle="(Not Just Teaches It)"
          gradient
        />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-8 md:mt-12">
          {/* Video */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-purple to-gold opacity-20 blur-2xl rounded-2xl md:rounded-3xl" />
            
            <div className="relative aspect-video bg-dark-secondary rounded-xl md:rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/videos/intro-poster.jpg"
                controls={isPlaying}
                playsInline
              >
                <source src="/videos/intro.mp4" type="video/mp4" />
              </video>

              {/* Play overlay */}
              {!isPlaying && (
                <motion.button
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlay}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/40"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gold flex items-center justify-center shadow-lg shadow-gold/30 mb-3 md:mb-4">
                    <HiPlay className="w-8 h-8 md:w-10 md:h-10 text-dark ml-1" />
                  </div>
                  <span className="text-white font-medium bg-black/50 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-sm md:text-base">
                    The Complete System Breakdown (6 min)
                  </span>
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Results headline */}
            <h3 className="text-lg md:text-xl font-display font-bold text-white mb-4 md:mb-6">
              My Credentials:
            </h3>

            {/* Credentials list */}
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {credentials.map((credential, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-2 md:gap-3"
                >
                  <span className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-success/20 flex items-center justify-center mt-0.5">
                    <HiCheck className="w-3 h-3 md:w-4 md:h-4 text-success" />
                  </span>
                  <span className="text-text-secondary text-sm md:text-base">{credential}</span>
                </motion.li>
              ))}
            </ul>

            {/* Why I'm Sharing */}
            <div className="glass-card rounded-lg md:rounded-xl p-4 md:p-6 border border-purple/30">
              <h4 className="text-base md:text-lg font-display font-bold text-white mb-2 md:mb-3">
                Why I'm Sharing This:
              </h4>
              <p className="text-text-secondary text-xs md:text-sm leading-relaxed">
                I'm not a guru selling courses. I'm an outbound operator who builds these systems 
                for clients every single day. This course is the exact process I follow — no theory, 
                no fluff. Just working systems that book meetings.
              </p>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap gap-2 md:gap-4 mt-4 md:mt-6">
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10">
                <span className="text-text-muted text-xs md:text-sm">👥 1132+ students trained</span>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10">
                <span className="text-text-muted text-xs md:text-sm">⭐ 4.9/5 from 180+ reviews</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Learn From a Practitioner
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
