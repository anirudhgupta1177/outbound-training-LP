import { motion } from 'framer-motion';
import { HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineTrendingUp, HiShieldCheck } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { formatPrice, convertINRToUSD, formatLargeAmount } from '../../constants/pricing';

export default function Personas() {
  const { pricing, isIndia } = usePricing();
  
  // Format currency-aware amounts
  const fiftyK = isIndia ? '₹50K+' : `$${convertINRToUSD(50000).toLocaleString('en-US')}+`;
  const fiveK = isIndia ? '₹5K' : `$${convertINRToUSD(5000).toLocaleString('en-US')}`;
  const oneCr = isIndia ? '₹1 Cr' : formatLargeAmount(convertINRToUSD(10000000), pricing.currency);
  
  const personas = [
    {
      icon: HiOutlineUser,
      title: 'Freelancers',
      pain: 'Competing on Upwork/Fiverr and tired of irregular income',
      promise: `Predictable pipeline monthly - enough to charge ${fiftyK} instead of competing at ${fiveK}`,
      technical: 'No coding needed - drag-and-drop automation tools',
      ideal: `Ideal if you want to charge ${fiftyK} per client`,
      color: 'from-blue-500 to-purple',
    },
    {
      icon: HiOutlineOfficeBuilding,
      title: 'Agency Owners',
      pain: 'Revenue drops 30% for every client churn. Referrals aren\'t enough.',
      promise: 'System generating 40+ opportunities monthly - no panic about churn again',
      technical: 'System handles 10X volume without hiring more BDRs',
      ideal: `Ideal if you want to scale over ${oneCr} instead of getting stuck`,
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Consultants & Coaches',
    pain: 'Spending more time hunting clients than serving them',
    promise: 'Calendar booked 3 weeks out- spend 95% of time on delivery, not prospecting',
    technical: 'AI does all the research and personalisation for you',
    ideal: 'Ideal if you hate prospecting manually for hours',
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineTrendingUp,
    title: 'Sales Reps',
    pain: 'Expected to hit quota with zero tools, training, or support',
    promise: 'Your own AI-powered prospecting machine - become the top performer',
    technical: 'Set it up in 2 weeks, runs forever with 30 min/week maintenance',
    ideal: 'Ideal if you want to hit 150% of quota without burning out',
    color: 'from-gold to-gold-light',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Personas() {
  const { pricing } = usePricing();
  
  return (
    <section id="risk-reversal" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 lg:gap-12 mt-8 md:mt-12 items-stretch">
          
          {/* Left: Personas - Title and Icons only */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-6 md:mb-8 text-center">
              This Works Best For :
            </h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
              className="grid grid-cols-2 gap-4 md:gap-6"
        >
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                    whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${persona.color} opacity-0 group-hover:opacity-20 blur-xl rounded-xl transition-opacity duration-500`} />
                
                    <div className="relative glass-card rounded-xl p-4 md:p-6 h-full flex flex-col items-center text-center">
                  {/* Icon */}
                      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-gradient-to-r ${persona.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                      <h3 className="text-base md:text-lg font-display font-bold text-white">
                    {persona.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

            {/* Bottom CTA text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-auto"
        >
              <div className="glass-card rounded-xl p-4 md:p-6 text-center border border-gold/30">
                <p className="text-sm md:text-base text-white">
                  Recognize yourself? Stop prospecting manually. <span className="text-gold font-bold">Start Building</span>
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Risk Reversal / Guarantee */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white mb-6 md:mb-8 text-center">
              Try Risk-Free for 30 Days
            </h2>

            {/* Main guarantee card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex-1"
            >
              {/* Glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-success/30 via-gold/30 to-success/30 blur-2xl rounded-2xl md:rounded-3xl" />
              
              <div className="relative glass-card rounded-xl md:rounded-2xl p-6 md:p-8 text-center border border-success/30 h-full flex flex-col">
                {/* Shield icon */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-br from-success to-gold flex items-center justify-center"
                >
                  <HiShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </motion.div>

                <h3 className="text-lg md:text-2xl font-display font-bold text-white mb-3 md:mb-4">
                  Here's My Promise:
                </h3>

                <p className="text-white font-medium text-sm md:text-base mb-4 leading-relaxed">
                  If you complete 100% of the course and still don't find value in it, email me and <span className="text-gold font-bold">I'll refund every rupee. No questions asked.</span>
                </p>

                <p className="text-text-secondary text-xs md:text-sm mb-4 leading-relaxed">
                  Why am I this confident? Because 1,132+ students have implemented this exact system successfully. If it worked for them, it'll work for you.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-6 md:mt-8 mt-auto"
        >
          <Button size="lg" className="w-full sm:w-auto">
                Try It Risk-Free for 30 Days - {pricing.displayPrice}
          </Button>
        </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
