import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full pt-3 pb-2 md:pt-5 md:pb-3 overflow-hidden"
    >
      {/* Purple ambient backdrop — matches the Hero gradient below so there is no hard black bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple/10 via-purple/5 to-transparent pointer-events-none" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-full h-48 bg-purple/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <a
          href="/"
          className="font-display font-bold tracking-tight select-none leading-none text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
          aria-label="IntentLedSales home"
        >
          <span className="text-white">Intent</span>
          <span className="text-gold">Led</span>
          <span className="text-white">Sales</span>
        </a>
      </div>
    </motion.div>
  );
}
