import { motion } from 'framer-motion';
import { HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineMap, HiOutlineDatabase, HiOutlineUserGroup, HiOutlineGift } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

// Import resource screenshots
import emailFrameworks from '../../assets/Screenshot for the Email Copywriting Frameworks.png';
import whatsappCommunity from '../../assets/Screenshot for the Whatsapp Community.png';
import leadLists from '../../assets/Screenshots of Lead Lists Resource.png';
import flowchart from '../../assets/flowchart/flowchart.png';

const items = [
  {
    icon: HiOutlineAcademicCap,
    title: '30+ Hours of Step-by-Step Video Training',
    description: 'Every tool, every setting, every automation — recorded in 1080p',
    details: 'Watch me build the entire system from scratch',
    modules: 'Lead scraping, AI personalization, email infrastructure, automation workflows, intent signals, meeting booking',
    value: '₹15,000',
    image: null,
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineBookOpen,
    title: '78-Page Outbound Implementation Guide',
    description: 'Copy-paste scripts, email templates, and frameworks',
    details: 'Every workflow documented with screenshots',
    modules: 'Tool setup checklists, troubleshooting guide, best practices, compliance & deliverability',
    value: '₹3,000',
    image: emailFrameworks,
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineMap,
    title: 'Visual Workflow Maps & Blueprints',
    description: 'All my automation blueprints in Whimsical',
    details: 'Just duplicate and deploy to your own account',
    modules: 'Lead enrichment flows, AI personalization workflows, email sequences, meeting booking automations',
    value: '₹5,000',
    image: null,
    color: 'from-gold to-gold-light',
  },
  {
    icon: HiOutlineDatabase,
    title: '500K+ Verified CXO Email Database',
    description: 'Ready-to-import lead lists by industry',
    details: 'All contacts verified with 95%+ deliverability',
    modules: 'Ecommerce, Marketing Agencies, SaaS, Software Dev Agencies, D2C Brands',
    value: '₹8,000',
    image: leadLists,
    color: 'from-gold-light to-success',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Private WhatsApp Community',
    description: 'Join 1132+ members closing deals with this system',
    details: 'Get help, share wins, network with other operators',
    modules: 'Strategy sessions, tool recommendations, live troubleshooting',
    value: '₹2,000',
    image: whatsappCommunity,
    color: 'from-success to-purple',
  },
  {
    icon: HiOutlineGift,
    title: 'BONUS: Complete System Setup Guide',
    description: 'Exactly what tools I use and how they\'re connected',
    details: 'Save 40+ hours of trial and error',
    modules: 'Tool recommendations, setup tutorials, integration guides, best practices',
    value: '₹4,000',
    image: null,
    color: 'from-purple to-gold',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function CompleteSystem() {
  return (
    <section id="what-you-get" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-secondary to-dark" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-30" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Everything You Need to Build Your AI-Powered Outbound Machine:"
          gradient
        />

        {/* Flowchart Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 md:mt-12 mb-8 md:mb-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/10">
              <h3 className="text-lg md:text-xl font-display font-bold text-white text-center">
                Complete Training Program Overview
              </h3>
              <p className="text-text-muted text-sm text-center mt-2">
                High-level flowchart of everything covered in the training
              </p>
            </div>
            <div className="bg-white p-2 md:p-4">
              <img 
                src={flowchart} 
                alt="Complete Training Program Flowchart" 
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 blur-xl rounded-xl md:rounded-2xl transition-opacity duration-500`} />
                
                <div className="relative glass-card rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col">
                  {/* Image preview if available */}
                  {item.image && (
                    <div className="aspect-video bg-dark-tertiary overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    {/* Icon & Value */}
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <span className="text-text-muted text-xs md:text-sm">Value: {item.value}</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-base md:text-lg font-display font-bold text-white mb-2 group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-text-secondary text-xs md:text-sm mb-2">
                      {item.description}
                    </p>
                    
                    {/* Details */}
                    <p className="text-text-muted text-xs mb-3">
                      {item.details}
                    </p>
                    
                    {/* Modules */}
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <p className="text-xs text-purple-light">
                        {item.modules}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Value Stack Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gold/30">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 md:gap-8">
              <div>
                <p className="text-text-muted text-xs md:text-sm">Total Value</p>
                <p className="text-xl md:text-2xl font-display font-bold text-text-muted line-through">₹37,000+</p>
              </div>
              <div className="text-2xl md:text-4xl text-gold">→</div>
              <div>
                <p className="text-text-muted text-xs md:text-sm">You Pay Today</p>
                <p className="text-3xl md:text-4xl font-display font-bold gradient-text">₹999 + GST</p>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-success/20 border border-success/30">
                <p className="text-success font-bold text-sm md:text-base">Save 98%</p>
              </div>
            </div>
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
            Get Everything for ₹999
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
