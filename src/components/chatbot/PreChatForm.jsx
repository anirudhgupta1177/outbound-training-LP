import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function PreChatForm() {
  const { setProfile, setProfileSubmitted, setMode, mode } = useChatStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    setProfile({ name: cleanName, email: cleanEmail });
    // Keep whatever mode is already set; default mode is resolved in the store.
    setMode(mode || 'pre-purchase');
    setProfileSubmitted(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, mode: mode || 'pre-purchase' }),
      });
    } catch (err) {
      console.error('Failed to store lead', err);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111118] overflow-hidden rounded-b-xl">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col flex-1 overflow-y-auto w-full h-full p-5"
      >
        <div className="mb-4 shrink-0">
          <h3 className="text-lg font-bold text-white mb-1">Welcome! 👋</h3>
          <p className="text-xs text-white/60">
            Please let us know a few details to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} id="pre-chat-form" className="flex flex-col gap-4 flex-1">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-2 py-1.5 rounded-lg shrink-0">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5 shrink-0">
            <label className="text-[10px] font-semibold text-white/50 ml-1">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <User className="h-3.5 w-3.5 text-white/30" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 shrink-0 pb-2">
            <label className="text-[10px] font-semibold text-white/50 ml-1">Your Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                <Mail className="h-3.5 w-3.5 text-white/30" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </form>
      </motion.div>

      <div className="shrink-0 p-4 border-t border-white/5 bg-[#111118]">
        <button
          type="submit"
          form="pre-chat-form"
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
        >
          Start Chatting
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
