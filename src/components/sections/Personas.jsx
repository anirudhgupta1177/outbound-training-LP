import { motion } from 'framer-motion';
import { HiOutlineCode, HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineChartBar } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const personas = [
  {
    icon: HiOutlineCode,
    title: 'Freelancers',
    pain: 'Competing on price on Upwork/Fiverr and tired of feast-or-famine income',
    promise: 'Predictable pipeline of 20-30 qualified leads monthly reaching out to YOU',
    technical: 'No coding needed - drag-and-drop automation tools',
    ideal: 'Ideal if you\'re charging ₹50K+ per client',
    color: 'from-blue-500 to-purple',
  },
  {
    icon: HiOutlineOfficeBuilding,
    title: 'Agency Owners',
    pain: 'Revenue drops 30% every time a client churns. Referrals aren\'t enough.',
    promise: 'Scalable outbound system generating 40+ opportunities monthly',
    technical: 'System handles 10X volume without hiring more BDRs',
    ideal: 'Ideal if you\'re doing ₹5L-50L annual revenue',
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineBriefcase,
    title: 'Consultants & Coaches',
    pain: 'Spending more time hunting clients than serving them',
    promise: 'Calendar filled with qualified prospects while you focus on delivery',
    technical: 'AI does all the research and personalization for you',
    ideal: 'Ideal if your time is worth ₹5K+/hour',
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Sales Reps at SMBs',
    pain: 'Expected to hit quota with zero tools, training, or support',
    promise: 'Your own AI-powered prospecting machine that makes you the top performer',
    technical: 'Set it up in 2 weeks, runs forever with 30 min/week maintenance',
    ideal: 'Ideal if you\'re tired of manual prospecting',
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
  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-secondary via-dark to-dark-secondary" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple to-transparent opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="This AI-Powered System is Perfect For:"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12"
        >
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${persona.color} opacity-0 group-hover:opacity-30 blur-xl rounded-xl md:rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative glass-card rounded-xl md:rounded-2xl p-4 md:p-6 h-full flex flex-col">
                  {/* Icon */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl bg-gradient-to-r ${persona.color} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-display font-bold text-white mb-3 md:mb-4">
                    {persona.title}
                  </h3>
                  
                  {/* Pain point */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-gold text-xs uppercase tracking-wider mb-1 font-medium">Your Problem</p>
                    <p className="text-text-secondary text-xs md:text-sm">
                      {persona.pain}
                    </p>
                  </div>
                  
                  {/* Promise */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-success text-xs uppercase tracking-wider mb-1 font-medium">What You'll Get</p>
                    <p className="text-white text-xs md:text-sm font-medium">
                      {persona.promise}
                    </p>
                  </div>

                  {/* Technical */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-purple-light text-xs uppercase tracking-wider mb-1 font-medium">Technical Benefit</p>
                    <p className="text-text-muted text-xs md:text-sm">
                      {persona.technical}
                    </p>
                  </div>
                  
                  {/* Ideal */}
                  <div className="mt-auto pt-3 md:pt-4 border-t border-white/10">
                    <p className="text-gold text-xs md:text-sm flex items-center gap-2">
                      <span>✅</span>
                      {persona.ideal}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gold/30">
            <p className="text-base md:text-lg text-white">
              If you need more clients and you're tired of manual prospecting —{' '}
              <span className="gradient-text font-bold">this is for you.</span>
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Start Building Your Pipeline
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
