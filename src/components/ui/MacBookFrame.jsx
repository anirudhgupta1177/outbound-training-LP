import { motion } from 'framer-motion';

export default function MacBookFrame({ 
  children, 
  className = '',
  tilt = false,
  caption = '',
  captionSmall = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
      whileHover={tilt ? { rotateY: 5, rotateX: -5 } : {}}
      style={{ perspective: 1000 }}
      className={`group ${className}`}
    >
      <div className="macbook-frame">
        {/* Top bar with dots */}
        <div className="flex items-center gap-1.5 mb-2 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>
        {/* Screen content */}
        <div className="macbook-screen">
          {children}
        </div>
      </div>
      {caption && (
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className={`text-center mt-4 ${
            captionSmall 
              ? 'text-text-secondary text-xs md:text-sm font-medium' 
              : 'text-text-secondary text-sm md:text-base font-medium'
          }`}
        >
          {caption}
        </motion.p>
      )}
    </motion.div>
  );
}




