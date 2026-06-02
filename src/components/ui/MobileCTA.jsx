import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './index';
import { usePricing } from '../../contexts/PricingContext';

export default function MobileCTA() {
  const { pricing } = usePricing();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (roughly)
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="bg-dark/95 backdrop-blur-lg border-t border-gold/30 px-4 py-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">Get the Complete System</p>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted text-xs line-through">{pricing.displayOriginalPrice}</span>
                  <span className="text-gold text-sm font-bold">{pricing.displayPrice}</span>
                </div>
              </div>
              <Button size="md" className="flex-shrink-0 animate-pulse-gold">
                Enroll Now
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
