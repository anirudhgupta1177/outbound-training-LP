import { motion } from 'framer-motion';

export default function SectionHeading({ 
  title, 
  subtitle, 
  centered = true,
  gradient = false,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={`mb-12 ${centered ? 'text-center' : ''} ${className}`}
    >
      <h2 
        className={`font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${
          gradient ? 'gradient-text' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}


