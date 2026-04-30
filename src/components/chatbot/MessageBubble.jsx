import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getRelativeTime } from '../../lib/chatUtils';

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const [relativeTime, setRelativeTime] = useState(
    getRelativeTime(new Date(message.timestamp))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(new Date(message.timestamp)));
    }, 30000);
    return () => clearInterval(interval);
  }, [message.timestamp]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="chat-avatar-small overflow-hidden">
              <img src="/ani.jpg" alt="Ani" className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] text-white/40 font-medium">Ani</span>
          </div>
        )}
        <div className={`message-bubble ${isUser ? 'message-user' : 'message-bot'}`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content text-sm leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="mt-1 text-[10px] text-white/30 px-1">{relativeTime}</span>
      </div>
    </motion.div>
  );
}
