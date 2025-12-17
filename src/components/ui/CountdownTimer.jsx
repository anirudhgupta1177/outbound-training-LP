import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer({ hours = 48, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({
    hours: hours,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Get or set the end time in localStorage
    const storageKey = 'countdown_end_time';
    let endTime = localStorage.getItem(storageKey);
    
    if (!endTime) {
      endTime = Date.now() + hours * 60 * 60 * 1000;
      localStorage.setItem(storageKey, endTime);
    } else {
      endTime = parseInt(endTime);
    }

    const timer = setInterval(() => {
      const now = Date.now();
      const difference = endTime - now;

      if (difference <= 0) {
        // Reset timer when it hits 0
        endTime = Date.now() + hours * 60 * 60 * 1000;
        localStorage.setItem(storageKey, endTime);
      }

      const hoursLeft = Math.floor(difference / (1000 * 60 * 60));
      const minutesLeft = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const secondsLeft = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: Math.max(0, hoursLeft),
        minutes: Math.max(0, minutesLeft),
        seconds: Math.max(0, secondsLeft),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hours]);

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <motion.div
        key={value}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="bg-dark-tertiary border border-purple/30 rounded-lg px-4 py-3 min-w-[70px]"
      >
        <span className="text-3xl md:text-4xl font-display font-bold gradient-text">
          {String(value).padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-text-muted text-sm mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className={`flex items-center justify-center gap-3 md:gap-4 ${className}`}>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-gold text-3xl font-bold mb-6">:</span>
      <TimeBlock value={timeLeft.minutes} label="Minutes" />
      <span className="text-gold text-3xl font-bold mb-6">:</span>
      <TimeBlock value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}


