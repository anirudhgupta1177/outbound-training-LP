import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineLightningBolt, HiOutlineMail, HiOutlineCalendar } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';

const stages = [
  {
    icon: HiOutlineSearch,
    number: '1',
    title: 'Intent-Based Lead Discovery',
    whatHappens: 'AI agents scrape LinkedIn, job boards, funding databases, tech stack sites',
    technical: 'Using Clay + Apollo + Phantombuster to find companies showing buying intent',
    outcome: '10,000+ verified leads identified in 48 hours',
    signals: ['Hiring', 'Raised funding', 'Tech migration', 'Expanding'],
    color: 'from-blue-500 to-purple',
  },
  {
    icon: HiOutlineLightningBolt,
    number: '2',
    title: 'AI-Powered Personalization at Scale',
    whatHappens: 'AI researches every prospect and writes custom emails',
    technical: 'ChatGPT API + web scraping pulls data from website, LinkedIn posts, recent news',
    outcome: '1000+ unique emails written daily - zero copy-paste templates',
    signals: null,
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineMail,
    number: '3',
    title: 'Multi-Inbox Automation Infrastructure',
    whatHappens: 'System sends emails 24/7 across multiple domains',
    technical: 'Smartlead + 10 warmed inboxes + SPF/DKIM/DMARC configured properly',
    outcome: '1000+ emails daily without hitting spam folders',
    stats: { open: '18%', reply: '8%' },
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineCalendar,
    number: '4',
    title: 'Auto-Qualification & Meeting Booking',
    whatHappens: 'AI qualifies replies and books meetings to your calendar',
    technical: 'Make.com workflows + AI sentiment analysis + Calendly integration',
    outcome: '30+ qualified meetings booked automatically',
    signals: null,
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
          title="How the AI-Powered Outbound Machine Actually Works:"
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

                  {/* What Happens */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-gold text-xs font-semibold uppercase tracking-wider mb-1">What Happens</p>
                    <p className="text-text-secondary text-xs md:text-sm">{stage.whatHappens}</p>
                  </div>

                  {/* Technical Part */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-purple-light text-xs font-semibold uppercase tracking-wider mb-1">The Technical Part</p>
                    <p className="text-text-muted text-xs">{stage.technical}</p>
                  </div>

                  {/* Outcome */}
                  <div className="mb-3 md:mb-4">
                    <p className="text-success text-xs font-semibold uppercase tracking-wider mb-1">The Outcome</p>
                    <p className="text-white text-xs md:text-sm font-medium">{stage.outcome}</p>
                  </div>

                  {/* Intent Signals - Stage 1 only */}
                  {stage.signals && (
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-auto">
                      {stage.signals.map((signal, i) => (
                        <span key={i} className="px-2 py-0.5 md:py-1 rounded-full bg-purple/20 text-purple-light text-xs">
                          {signal}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats - Stage 3 only */}
                  {stage.stats && (
                    <div className="flex gap-3 md:gap-4 mt-auto">
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-display font-bold text-gold">{stage.stats.open}</p>
                        <p className="text-text-muted text-xs">Open Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg md:text-xl font-display font-bold text-gold">{stage.stats.reply}</p>
                        <p className="text-text-muted text-xs">Reply Rate</p>
                      </div>
                    </div>
                  )}
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
