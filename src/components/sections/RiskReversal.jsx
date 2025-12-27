import { motion } from 'framer-motion';
import { HiShieldCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

export default function RiskReversal() {
  return (
    <section id="risk-reversal" className="py-12 md:py-20 relative overflow-hidden">
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
            
            <p className="text-text-secondary text-sm md:text-lg max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed">
              Implement the system following the step-by-step training. Give it an honest 30-day try.
            </p>

            <p className="text-white font-medium text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
              If you complete 100% of the course and still don't find value in it, email me and I'll refund every rupee. No questions asked.
            </p>

            <p className="text-text-secondary text-sm md:text-base max-w-2xl mx-auto mb-4 md:mb-6 leading-relaxed">
              Why am I this confident? Because 1,132+ students have implemented this exact system successfully. If it worked for them, it'll work for you.
            </p>

            <p className="text-gold font-medium text-base md:text-lg">
              And if somehow it doesn't? I don't want your money.
            </p>
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
            Try It Risk-Free for 30 Days - ₹3,497
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
