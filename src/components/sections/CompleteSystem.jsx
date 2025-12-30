import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineMap, HiOutlineDatabase, HiOutlineUserGroup, HiOutlineGift, HiOutlineChip, HiOutlineTemplate } from 'react-icons/hi';
import { SectionHeading, Button } from '../ui';
import { usePricing } from '../../contexts/PricingContext';
import { formatPrice, convertINRToUSD } from '../../constants/pricing';

// Import resource screenshots
import emailFrameworks from '../../assets/Screenshot for the Email Copywriting Frameworks.png';
import whatsappCommunity from '../../assets/Screenshot for the Whatsapp Community.png';
import leadLists from '../../assets/Screenshots of Lead Lists Resource.png';
import flowchart from '../../assets/flowchart/flowchart.png';
import card2Image from '../../assets/card2.png';
import card4Image from '../../assets/card4.png';
import card5Image from '../../assets/card5.png';

// Import tech stack logos
import apolloLogo from '../../assets/tech-stack/apollonew.png';
import clayLogo from '../../assets/tech-stack/Clay-Logo-Light-1024x548.png';
import instantlyLogo from '../../assets/tech-stack/Instantly.ai logo.webp';
import makeLogo from '../../assets/tech-stack/makecm.jpeg';
import n8nLogo from '../../assets/tech-stack/n8n-logo.png';
import apifyLogo from '../../assets/tech-stack/Apify_Logo.svg.png';
import anthropicLogo from '../../assets/tech-stack/anthropic-icon.webp';
import zenrowsLogo from '../../assets/tech-stack/Zenrows logo.webp';
import heyreachLogo from '../../assets/tech-stack/Heyreach Logo.png';
import trigifyLogo from '../../assets/tech-stack/Trigify logo.svg';
import betterContactsLogo from '../../assets/tech-stack/Better contacts logo.webp';
import findymailLogo from '../../assets/tech-stack/Findymail Logo.png';
import smartleadLogo from '../../assets/tech-stack/Smartlead Logo.webp';
import linkedinSalesNavLogo from '../../assets/tech-stack/linkedin.png';
import serperLogo from '../../assets/tech-stack/Serper logo.webp';
import firecrawlLogo from '../../assets/tech-stack/firecrawl-logo.png';
import openaiLogo from '../../assets/tech-stack/openai-chatgpt-logo-icon-free-png.webp';
import zapmailLogo from '../../assets/tech-stack/Zapmail Logo.ico';
import hypertideLogo from '../../assets/tech-stack/hypertide.png';
import scaledmailLogo from '../../assets/tech-stack/scaledmail.jpeg';
import perplexityLogo from '../../assets/tech-stack/perplexity.jpeg';
import oceanioLogo from '../../assets/tech-stack/oceanio.jpeg';
import storeleadsLogo from '../../assets/tech-stack/storeleads.jpeg';
import phantombusterLogo from '../../assets/tech-stack/Phantombuster+logo.png';

const techStackLogos = [
  { name: 'Apollo.io', logo: apolloLogo },
  { name: 'Clay', logo: clayLogo },
  { name: 'Instantly', logo: instantlyLogo },
  { name: 'Make.com', logo: makeLogo },
  { name: 'n8n', logo: n8nLogo },
  { name: 'Apify', logo: apifyLogo },
  { name: 'Anthropic', logo: anthropicLogo },
  { name: 'Zenrows', logo: zenrowsLogo },
  { name: 'HeyReach', logo: heyreachLogo },
  { name: 'Trigify', logo: trigifyLogo },
  { name: 'Better Contacts', logo: betterContactsLogo },
  { name: 'Findymail', logo: findymailLogo },
  { name: 'Smartlead', logo: smartleadLogo },
  { name: 'LinkedIn Sales Navigator', logo: linkedinSalesNavLogo },
  { name: 'Serper', logo: serperLogo },
  { name: 'Firecrawl', logo: firecrawlLogo },
  { name: 'OpenAI', logo: openaiLogo },
  { name: 'Zapmail', logo: zapmailLogo },
  { name: 'Hypertide', logo: hypertideLogo },
  { name: 'Scalemail', logo: scaledmailLogo },
  { name: 'Perplexity', logo: perplexityLogo },
  { name: 'Ocean.io', logo: oceanioLogo },
  { name: 'Storeleads', logo: storeleadsLogo },
  { name: 'Phantombuster', logo: phantombusterLogo },
];

// Base items with INR values - will be converted dynamically
const itemsBase = [
  {
    icon: HiOutlineAcademicCap,
    title: '30+ Hours Video Training',
    description: 'Every tool, every setting, every automation - recorded in 1080p quality',
    details: 'Watch me build the entire system from scratch, including ready-to-deploy automation agents',
    modules: ['ICP & Offer Creation', 'Email Deliverability', 'LinkedIn Outreach', 'Lead Scraping', 'Clay Mastery', 'Automation'],
    valueINR: 15000,
    image: card2Image,
    color: 'from-purple to-purple-light',
  },
  {
    icon: HiOutlineBookOpen,
    title: '78-Page Implementation Guide',
    description: 'Copy-paste scripts, email templates, and ready-to-use frameworks',
    details: 'Everything you need to implement - deliverability checklists, ICP frameworks, and tested copy templates',
    modules: ['Tool setup checklists', 'Deliverability Guides', 'Copy Templates', 'ICP & Offer frameworks', 'Compliance'],
    valueINR: 3000,
    image: emailFrameworks,
    color: 'from-purple-light to-gold',
  },
  {
    icon: HiOutlineMap,
    title: 'Visual Workflow Maps & Blueprints',
    description: 'All my automation templates and whimsical blueprints ready to use',
    details: 'Don\'t build from scratch. Duplicate my proven workflows that work immediately',
    modules: ['Lead enrichment flows', 'AI personalization workflows', 'Email sequences', 'Meeting booking'],
    valueINR: 5000,
    image: card4Image,
    color: 'from-gold to-gold-light',
  },
  {
    icon: HiOutlineDatabase,
    title: '500K+ Verified CXO Email Database',
    description: 'Ready-to-import lead lists organized by industry for immediate use',
    details: 'Skip months of prospecting work. All contacts are verified and ready to reach out',
    modules: ['Ecommerce', 'Marketing Agencies', 'SaaS', 'Software Dev Agencies', 'D2C Brands'],
    valueINR: 15000,
    image: card5Image,
    color: 'from-gold-light to-success',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Private WhatsApp Community Access',
    description: 'Join 1132+ active members who are closing deals daily using this exact system',
    details: 'Get instant help when stuck, share your wins with the community, and network with successful operators',
    modules: ['Strategy discussions', 'Deliverability troubleshooting', 'Live support', 'Lifetime access'],
    valueINR: 2000,
    image: whatsappCommunity,
    color: 'from-success to-purple',
  },
  {
    icon: HiOutlineGift,
    title: 'BONUS: Complete Setup Guide',
    description: 'Exactly what tools I use daily and how they\'re all connected together',
    details: 'Save 40+ hours of trial and error by following my exact setup process',
    modules: ['Tool recommendations', 'Setup tutorials', 'Integration guides', 'Best practices'],
    valueINR: 4000,
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
  const { pricing, isIndia, country } = usePricing();
  
  // Debug logging - runs on every render when pricing changes
  useEffect(() => {
    if (window.location.search.includes('country=')) {
      console.log('✅ CompleteSystem rendered - Currency:', pricing.currency, 'isIndia:', isIndia, 'country:', country, 'displayPrice:', pricing.displayPrice);
    }
  }, [pricing, isIndia, country]);
  
  // Convert item values based on currency
  const getItemValue = (inrValue) => {
    const value = isIndia 
      ? `₹${inrValue.toLocaleString('en-IN')}`
      : `$${convertINRToUSD(inrValue).toLocaleString('en-US')}`;
    if (window.location.search.includes('country=')) {
      console.log('CompleteSystem - Converting:', inrValue, 'to', value, 'isIndia:', isIndia);
    }
    return value;
  };
  
  // Create dynamic items array with currency-aware values
  const items = itemsBase.map(item => ({
    ...item,
    value: getItemValue(item.valueINR)
  }));
  
  // Calculate original total value
  const originalTotalValue = isIndia ? 44000 : convertINRToUSD(44000);
  const originalTotalDisplay = formatPrice(originalTotalValue, pricing.currency);
  
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

        {/* 3-Column Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-12"
        >
          {/* Flowchart Card - First */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-gold to-gold-light opacity-0 group-hover:opacity-20 blur-xl rounded-xl md:rounded-2xl transition-opacity duration-500" />
            
            {/* Desktop: Original vertical layout */}
            <div className="hidden md:block relative glass-card rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col">
              {/* Flowchart Image */}
              <div className="aspect-video bg-white overflow-hidden">
                <img
                  src={flowchart}
                  alt="Complete Training Program Overview"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              
              {/* Content */}
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                {/* Icon and Title */}
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-gold to-gold-light flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <HiOutlineTemplate className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-base md:text-lg font-display font-bold text-white group-hover:text-gold transition-colors leading-tight">
                      Training Program Overview
                    </h3>
                  </div>
                </div>
                  </div>
                </div>
                
            {/* Mobile: Horizontal layout - Content left, Image right */}
            <div className="md:hidden relative glass-card rounded-lg overflow-hidden flex flex-row">
              {/* Content left side */}
              <div className="flex-1 flex items-center p-3">
                <div className="flex-1 flex flex-col justify-center">
                {/* Title */}
                  <h3 className="text-sm font-display font-bold text-white group-hover:text-gold transition-colors leading-tight">
                  Training Program Overview
                </h3>
                </div>
                
                {/* Image rightmost */}
                <div className="w-20 h-20 bg-white overflow-hidden flex-shrink-0 ml-2">
                  <img
                    src={flowchart}
                    alt="Complete Training Program Overview"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Standard Cards */}
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
                
                {/* Desktop: Original vertical layout */}
                <div className="hidden md:block relative glass-card rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col">
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
                    {/* Icon, Title, and Value */}
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-base md:text-lg font-display font-bold text-white group-hover:text-gold transition-colors leading-tight mb-1 md:mb-2">
                          {item.title}
                        </h3>
                        {/* Value */}
                        <span className="text-text-secondary text-xs md:text-sm font-medium">Value: {item.value}</span>
                      </div>
                    </div>
                  </div>
                    </div>
                    
                {/* Mobile: Horizontal layout - Content left, Image right */}
                <div className="md:hidden relative glass-card rounded-lg overflow-hidden flex flex-row">
                  {/* Content left side */}
                  <div className="flex-1 flex items-center p-3">
                    <div className="flex-1 flex flex-col justify-center">
                    {/* Title */}
                      <h3 className="text-sm font-display font-bold text-white group-hover:text-gold transition-colors leading-tight mb-1">
                      {item.title}
                    </h3>
                      {/* Value */}
                      <span className="text-text-secondary text-xs font-medium">Value: {item.value}</span>
                    </div>
                    
                    {/* Image rightmost */}
                    {item.image && (
                      <div className="w-20 h-20 bg-dark-tertiary overflow-hidden flex-shrink-0 ml-2">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                    </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* Tech Stack Card - Last, spans 2 columns */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative sm:col-span-2"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple to-purple-light opacity-0 group-hover:opacity-20 blur-xl rounded-xl md:rounded-2xl transition-opacity duration-500" />
            
            {/* Desktop: Original layout */}
            <div className="hidden md:block relative glass-card rounded-xl md:rounded-2xl overflow-hidden h-full flex flex-col border border-purple/30">
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                {/* Icon, Title, and Description */}
                <div className="flex items-start gap-3 md:gap-4 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-purple to-purple-light flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <HiOutlineChip className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    {/* Title */}
                    <h3 className="text-base md:text-lg font-display font-bold text-white group-hover:text-gold transition-colors leading-tight mb-2">
                      Tools You'll Master in This Course
                    </h3>
                    {/* Description */}
                    <p className="text-text-secondary text-xs md:text-sm">
                      Master 20+ industry-leading tools for outbound automation
                    </p>
                  </div>
                </div>
                
                {/* Tech Stack Logos - Starting from extreme left, all in one line (no scroll) */}
                <div className="flex flex-nowrap gap-1.5 md:gap-2 justify-start items-center">
                  {techStackLogos.slice(0, 18).map((tool, idx) => (
                    <div
                      key={idx}
                      className="w-7 h-7 md:w-9 md:h-9 bg-white/10 rounded-lg p-1 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                      title={tool.name}
                    >
                      <img 
                        src={tool.logo} 
                        alt={tool.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile: Horizontal layout - Content left, Logos right */}
            <div className="md:hidden relative glass-card rounded-lg overflow-hidden flex flex-row border border-purple/30">
              {/* Content left side */}
              <div className="flex-1 flex items-center p-3">
                <div className="flex-1 flex flex-col justify-center">
                {/* Title */}
                  <h3 className="text-sm font-display font-bold text-white group-hover:text-gold transition-colors leading-tight">
                  Tools You'll Master in This Course
                </h3>
                </div>
                
                {/* Logos right - compact */}
                <div className="flex flex-nowrap gap-1 items-center flex-shrink-0">
                  {techStackLogos.slice(0, 6).map((tool, idx) => (
                      <div
                        key={idx}
                      className="w-6 h-6 bg-white/10 rounded p-0.5 flex items-center justify-center flex-shrink-0"
                        title={tool.name}
                      >
                        <img 
                          src={tool.logo} 
                          alt={tool.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Value Stack Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 md:mt-12"
        >
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 text-center border border-gold/30">
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 md:gap-8">
              <div>
                <p className="text-text-muted text-xs md:text-sm">Total Value</p>
                <p className="text-xl md:text-2xl font-display font-bold text-text-muted line-through">{originalTotalDisplay}+</p>
              </div>
              <div className="text-2xl md:text-4xl text-gold">→</div>
              <div>
                <p className="text-text-muted text-xs md:text-sm">You Pay Today</p>
                <p className="text-3xl md:text-4xl font-display font-bold gradient-text">
                  {pricing.displayPrice}{isIndia && ' + GST'}
                </p>
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-success/20 border border-success/30">
                <p className="text-success font-bold text-sm md:text-base">Save 79%</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 md:mt-12"
        >
          <Button size="lg" className="w-full sm:w-auto">
            Get Everything for {pricing.displayPrice}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
