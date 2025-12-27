import { motion } from 'framer-motion';

export default function ProgressBar({ 
  current = 32, 
  total = 50, 
  label = 'spots filled',
  className = '' 
}) {
  const percentage = (current / total) * 100;

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="mb-2">
        <span className="text-text-secondary text-sm">
          <span className="text-gold font-bold">{current}</span> / {total} {label}
        </span>
      </div>
      <div className="h-3 bg-dark-tertiary rounded-full overflow-hidden border border-purple/20 mb-2">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${percentage}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-purple to-gold rounded-full relative"
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ width: '50%' }}
          />
        </motion.div>
      </div>
      <div className="text-center">
        <span className="text-error text-sm font-medium">
          Only {total - current} left!
        </span>
      </div>
    </div>
  );
}




