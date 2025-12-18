import { motion } from 'framer-motion';
import { HiShieldCheck, HiCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const whatHappens = [
  'Instant access to all 30+ hours of content',
  'Download all resources immediately',
  'Join WhatsApp community within 5 minutes',
  'Start building your system today',
  'Book your first meeting within 14 days',
];

export default function RiskReversal() {
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Try The Entire System Risk-Free for 30 Days"
        />

        {/* Main guarantee card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mt-8 md:mt-12"
        >
          {/* Glow */}
          <div className="absolute -inset-2 bg-gradient-to-r from-success/30 via-gold/30 to-success/30 blur-2xl rounded-2xl md:rounded-3xl" />
          
          <div className="relative glass-card rounded-xl md:rounded-2xl p-6 md:p-12 text-center border border-success/30">
            {/* Shield icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-success to-gold flex items-center justify-center"
            >
              <HiShieldCheck className="w-8 h-8 md:w-12 md:h-12 text-white" />
            </motion.div>

            <h3 className="text-xl md:text-3xl font-display font-bold text-white mb-3 md:mb-4">
              Here's My Promise:
            </h3>
            
            <p className="text-text-secondary text-sm md:text-lg max-w-2xl mx-auto mb-4 md:mb-6">
              Go through the entire training. Implement everything step by step. 
              <span className="text-white font-medium"> If you complete 100% of the course and still don't find value in it, </span>
              email me and I'll refund every rupee. No questions asked.
            </p>

            <p className="text-gold font-medium text-base md:text-lg mb-4 md:mb-6">
              Simple: Complete the training, and if you're not satisfied — full refund.
            </p>

            {/* Why I'm confident */}
            <div className="bg-white/5 rounded-lg md:rounded-xl p-3 md:p-4 max-w-lg mx-auto">
              <p className="text-xs md:text-sm text-text-muted">
                <span className="text-white font-medium">Why I'm Confident: </span>
                1132+ students have gone through this training and implemented the system successfully. 
                The content speaks for itself — I stand behind every module.
              </p>
            </div>
          </div>
        </motion.div>

        {/* What happens when you join */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12"
        >
          <h4 className="text-lg md:text-xl font-display font-bold text-white text-center mb-4 md:mb-6">
            What Happens When You Join:
          </h4>
          
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {whatHappens.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5"
                >
                  <HiCheck className="w-3 h-3 md:w-4 md:h-4 text-success flex-shrink-0" />
                  <span className="text-text-secondary text-xs md:text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Start Risk-Free for ₹3497
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
