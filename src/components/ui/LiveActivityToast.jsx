import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const entries = [
  { name: 'Pranav', city: 'Bengaluru' },
  { name: 'Marcus', city: 'Austin' },
  { name: 'Priya', city: 'Mumbai' },
  { name: 'James', city: 'London' },
  { name: 'Arjun', city: 'Delhi' },
  { name: 'Sarah', city: 'Toronto' },
  { name: 'Rahul', city: 'Pune' },
  { name: 'Alex', city: 'Sydney' },
  { name: 'Sneha', city: 'Hyderabad' },
  { name: 'Daniel', city: 'Berlin' },
];

export default function LiveActivityToast() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    // Show first toast after 8s
    const initialDelay = setTimeout(() => {
      setCurrentIndex(0);
      setVisible(true);
    }, 8000);
    return () => clearTimeout(initialDelay);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || currentIndex < 0) return;
    // Show for 5s, hide for 20s, then show next
    const hideTimer = setTimeout(() => setVisible(false), 5000);
    const nextTimer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % entries.length);
      setVisible(true);
    }, 25000);
    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [currentIndex, dismissed]);

  const dismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
  }, []);

  if (dismissed || currentIndex < 0) return null;

  const entry = entries[currentIndex];
  const minutesAgo = Math.floor(Math.random() * 8) + 2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-3 glass-card rounded-xl px-4 py-3 max-w-xs border border-white/10"
        >
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🎉</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{entry.name} from {entry.city}</p>
            <p className="text-text-muted text-xs">just enrolled · {minutesAgo} min ago</p>
          </div>
          <button
            onClick={dismiss}
            className="text-text-muted hover:text-white text-xs flex-shrink-0 p-1"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
