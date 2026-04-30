import { memo } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';

const forList = [
  'Freelancers and agency owners struggling with inconsistent lead flow',
  'Consultants and coaches who want predictable sales meetings',
  "Anyone who has tried cold outreach but couldn't scale it effectively",
];

const notForList = [
  'Beginners looking for overnight results without implementation',
  'People unwilling to set up systems or follow structured processes',
  'Those expecting done-for-you services instead of a system to execute',
];

function AudienceQualification() {
  return (
    <section id="who-this-is-for" className="py-6 md:py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-secondary to-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4 md:mb-5"
        >
          <h2 className="font-display text-xl md:text-2xl font-bold mb-1 gradient-text">
            Is This For You?
          </h2>
          <p className="text-text-secondary text-xs md:text-sm max-w-2xl mx-auto">
            A straight answer before you read further — so you know whether this will actually move the needle for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          {/* WHO THIS IS FOR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl p-4 md:p-5 bg-dark-secondary/80 border border-gold/30 backdrop-blur-sm"
          >
            <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-gold/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-gold/10 border border-gold/40">
                  <HiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                </div>
                <h3 className="font-display text-base md:text-lg font-bold text-white">
                  Who this is for
                </h3>
              </div>

              <ul className="space-y-1.5 md:space-y-2">
                {forList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <HiCheckCircle className="w-4 h-4 md:w-4 md:h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-text-secondary leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* WHO THIS IS NOT FOR */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-xl p-4 md:p-5 bg-dark-secondary/80 border border-purple/30 backdrop-blur-sm"
          >
            <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-purple/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple/10 border border-purple/40">
                  <HiXCircle className="w-4 h-4 md:w-5 md:h-5 text-purple-light" />
                </div>
                <h3 className="font-display text-base md:text-lg font-bold text-white">
                  Who this is not for
                </h3>
              </div>

              <ul className="space-y-1.5 md:space-y-2">
                {notForList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <HiXCircle className="w-4 h-4 md:w-4 md:h-4 text-purple-light flex-shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-text-secondary leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default memo(AudienceQualification);
