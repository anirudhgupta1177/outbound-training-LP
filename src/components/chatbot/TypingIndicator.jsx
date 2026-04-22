import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-start gap-2">
        <div className="chat-avatar-small mt-1">
          <span className="text-[9px] font-bold text-white">AI</span>
        </div>
        <div className="message-bubble message-bot">
          <motion.div className="flex items-center gap-1.5 py-1 px-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-2 w-2 rounded-full bg-white/40"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  ease: 'easeInOut',
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
