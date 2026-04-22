import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import ChatPanel from './ChatPanel';

export default function ChatWidget() {
  const { isOpen, toggleChat } = useChatStore();

  if (import.meta.env.VITE_CHATBOT_ENABLED === 'false') {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-[9999] md:bottom-24 md:right-6"
            style={{ transformOrigin: 'bottom right' }}
          >
            <div className="chat-panel-container">
              <ChatPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[9998] md:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 z-[10000] flex h-[60px] w-[60px] items-center justify-center rounded-full shadow-2xl transition-colors md:bottom-6 md:right-6 launcher-button"
        animate={isOpen ? { scale: 1 } : { scale: [1, 1.08, 1] }}
        transition={
          isOpen
            ? { duration: 0.2 }
            : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
        }
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        id="chatbot-launcher"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
