import { memo } from 'react';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { SectionHeading } from '../ui';

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
    <section id="who-this-is-for" className="py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-secondary to-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Is This For You?"
          subtitle="A straight answer before you read further — so you know whether this will actually move the needle for you."
          gradient
        />

        <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* WHO THIS IS FOR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative rounded-2xl p-6 md:p-8 bg-dark-secondary/80 border border-gold/30 backdrop-blur-sm"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-gold/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/10 border border-gold/40">
                  <HiCheckCircle className="w-6 h-6 md:w-7 md:h-7 text-gold" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                  Who this is for
                </h3>
              </div>

              <ul className="space-y-3 md:space-y-4">
                {forList.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <HiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-text-secondary leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* WHO THIS IS NOT FOR */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative rounded-2xl p-6 md:p-8 bg-dark-secondary/80 border border-purple/30 backdrop-blur-sm"
          >
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-purple/20 via-transparent to-transparent pointer-events-none" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple/10 border border-purple/40">
                  <HiXCircle className="w-6 h-6 md:w-7 md:h-7 text-purple-light" />
                </div>
                <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                  Who this is not for
                </h3>
              </div>

              <ul className="space-y-3 md:space-y-4">
                {notForList.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <HiXCircle className="w-5 h-5 md:w-6 md:h-6 text-purple-light flex-shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-text-secondary leading-relaxed">
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
