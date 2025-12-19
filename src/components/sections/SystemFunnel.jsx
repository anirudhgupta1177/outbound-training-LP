import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineLightningBolt, HiOutlineMail, HiOutlineCalendar } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

// Import logos for Technical Part
import clayLogo from '../../assets/tech-stack/Clay-Logo-Light-1024x548.png';
import apolloLogo from '../../assets/tech-stack/apollonew.png';
import phantombusterLogo from '../../assets/tech-stack/Phantombuster+logo.png';
import oceanioLogo from '../../assets/tech-stack/oceanio.jpeg';
import storeleadsLogo from '../../assets/tech-stack/storeleads.jpeg';
import openaiLogo from '../../assets/tech-stack/openai-chatgpt-logo-icon-free-png.webp';
import anthropicLogo from '../../assets/tech-stack/claudenew.png';
import perplexityLogo from '../../assets/tech-stack/perplexity.jpeg';
import zenrowsLogo from '../../assets/tech-stack/Zenrows logo.webp';
import linkedinLogo from '../../assets/tech-stack/linkedin.png';
import hypertideLogo from '../../assets/tech-stack/hypertide.png';
import scaledmailLogo from '../../assets/tech-stack/scaledmail.jpeg';
import instantlyLogo from '../../assets/tech-stack/Instantly.ai logo.webp';
import smartleadLogo from '../../assets/tech-stack/Smartlead Logo.webp';
import zapmailLogo from '../../assets/tech-stack/Zapmail Logo.ico';
import makeLogo from '../../assets/tech-stack/makecm.jpeg';
import n8nLogo from '../../assets/tech-stack/n8n-logo.png';
import calendlyLogo from '../../assets/tech-stack/calednly.png';
import zapierLogo from '../../assets/tech-stack/zapier.png';
import calcomLogo from '../../assets/tech-stack/calcomnew.png';

const stages = [
  {
    icon: HiOutlineSearch,
    number: '1',
    title: 'Intent-Based Lead Discovery',
    whatHappens: 'AI agents finds companies showing active buying intent signals',
    technicalLogos: [
      { name: 'Clay', logo: clayLogo },
      { name: 'Apollo', logo: apolloLogo },
      { name: 'Phantombuster', logo: phantombusterLogo },
      { name: 'Ocean.io', logo: oceanioLogo },
    ],
    outcome: '10,000+ verified leads identified in 24 hours',
    color: 'from-blue-500 to-purple',
  },
  {
    icon: HiOutlineLightningBolt,
    number: '2',
    title: 'AI-Powered Personalization at Scale',
    whatHappens: 'AI researches every prospect and writes unique emails',
    technicalLogos: [
      { name: 'ChatGPT', logo: openaiLogo },
      { name: 'Claude', logo: anthropicLogo },
      { name: 'Perplexity', logo: perplexityLogo },
      { name: 'Zenrows', logo: zenrowsLogo },
    ],
    outcome: '1000+ unique emails written daily - zero copy-paste templates',
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineMail,
    number: '3',
    title: 'Multi-Inbox Automation Infrastructure',
    whatHappens: 'System sends emails 24/7 across multiple warmed domains',
    technicalLogos: [
      { name: 'Hypertide', logo: hypertideLogo },
      { name: 'Scalemail', logo: scaledmailLogo },
      { name: 'Instantly', logo: instantlyLogo },
      { name: 'Smartlead', logo: smartleadLogo },
    ],
    outcome: '1000+ emails daily without hitting spam, 8% reply rate',
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineCalendar,
    number: '4',
    title: 'Auto-Qualification & Meeting Booking',
    whatHappens: 'AI qualifies replies and books meetings to your calendar',
    technicalLogos: [
      { name: 'Make.com', logo: makeLogo },
      { name: 'n8n', logo: n8nLogo },
      { name: 'Zapier', logo: zapierLogo },
      { name: 'Cal.com', logo: calcomLogo },
    ],
    outcome: '30+ qualified meetings booked automatically',
    color: 'from-gold to-gold-light',
  },
];

export default function SystemFunnel() {
  return (
    <section id="how-it-works" className="py-12 md:py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dark" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-48 md:w-72 h-48 md:h-72 bg-purple/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-48 md:w-72 h-48 md:h-72 bg-gold/20 rounded-full blur-3xl" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Here's Exactly How the AI-Powered Outbound Machine Works:"
          subtitle="A 4-stage system that runs 24/7 to fill your calendar with qualified prospects"
        />

        {/* 4-Stage Process */}
        <div className="mt-8 md:mt-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Connection line - desktop only */}
                {index < 3 && (
                  <div className="hidden xl:block absolute top-14 md:top-16 -right-2 md:-right-3 w-4 md:w-6 h-0.5 bg-gradient-to-r from-purple to-gold z-10" />
                )}
                
                {/* Card */}
                <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 h-full border border-white/10 hover:border-gold/30 transition-colors relative overflow-hidden">
                  {/* Stage number badge */}
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${stage.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <span className="text-3xl md:text-4xl font-display font-bold text-white/10 group-hover:text-white/20 transition-colors">
                      {stage.number}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base md:text-lg font-display font-bold text-white mb-3 md:mb-4 group-hover:text-gold transition-colors">
                    {stage.title}
                  </h3>

                  {/* Technical Part - Logos only, no heading */}
                  <div className="mb-3 md:mb-4">
                    <div className="flex gap-2 md:gap-2.5 justify-start flex-wrap">
                      {stage.technicalLogos.map((tool, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 md:w-10 md:h-10 bg-white/5 rounded-md p-1 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10 flex-shrink-0"
                          title={tool.name}
                        >
                          {tool.logo ? (
                            <img 
                              src={tool.logo} 
                              alt={tool.name} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-text-muted text-[8px] md:text-xs text-center leading-tight">{tool.name}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcome */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-success text-xs font-semibold uppercase tracking-wider mb-1">The Outcome</p>
                    <p className="text-white text-xs md:text-sm font-medium">{stage.outcome}</p>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Call-Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gold/30">
            <p className="text-base md:text-lg text-white font-medium">
              The entire system runs without you. You just show up to meetings with people ready to buy.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 md:mt-8"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Get the Complete System
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
