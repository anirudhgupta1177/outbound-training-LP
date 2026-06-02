import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePricing } from '../../contexts/PricingContext';

export default function MobileCTA() {
  const { pricing } = usePricing();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
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
            <Link
              to="/checkout"
              className="hero-cta block w-full text-center rounded-xl px-4 py-3 font-display font-bold text-sm"
            >
              <span>Start Filling Your Calendar</span>
              <span className="ml-2">
                <span className="line-through opacity-50 text-xs">{pricing.displayOriginalPrice}</span>
                {' '}
                <span>{pricing.displayPrice}</span>
              </span>
            </Link>
            <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-text-muted">
              <span>🔒 Secure Checkout</span>
              <span>·</span>
              <span>30-day Guarantee</span>
              <span>·</span>
              <span>Instant Access</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
