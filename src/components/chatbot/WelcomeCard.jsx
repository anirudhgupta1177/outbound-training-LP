import { motion } from 'framer-motion';
import { useChatStore } from '../../store/chatStore';

export default function WelcomeCard() {
  const { mode } = useChatStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="px-4 pt-4"
    >
      <div className="welcome-card">
        <div className="flex items-center gap-3 mb-3">
          <div className="welcome-avatar overflow-hidden">
            <img src="/ani.jpg" alt="Ani" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Ani</h3>
            <p className="text-[11px] text-white/50">Your Course Assistant</p>
          </div>
        </div>

        <p className="text-[13px] text-white/70 leading-relaxed">
          {mode === 'post-purchase'
            ? "Welcome back! I'm here to help you navigate every module of The Organic Buzz course and answer any onboarding questions. Ask away!"
            : "Hi there! 👋 I can help you understand everything about The Organic Buzz — AI-Powered Outbound System: what's included, pricing, timeline, and more. Ask anything!"}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400/80">
            Online — typically responds in seconds
          </span>
        </div>
      </div>
    </motion.div>
  );
}
