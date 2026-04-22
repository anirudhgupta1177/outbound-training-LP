import { useRef, useEffect, useState } from 'react';
import { X, MoreHorizontal, MessageSquarePlus, RefreshCw, Download, XCircle } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import WelcomeCard from './WelcomeCard';
import SuggestedChips from './SuggestedChips';
import PreChatForm from './PreChatForm';

export default function ChatPanel() {
  const {
    messages,
    closeChat,
    showWelcome,
    mode,
    clearMessages,
    profileSubmitted,
    setProfileSubmitted,
    chatEnded,
    endChat,
    startNewChat,
  } = useChatStore();
  const messagesEndRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasMessages = messages.length > 0;

  const handleNewChat = () => {
    clearMessages();
    setIsMenuOpen(false);
  };

  // Cosmetic refresh: briefly show a spinner over the messages area.
  // Does NOT clear messages, does NOT touch profile, does NOT interrupt
  // any in-flight response. Just a visual reload cue.
  const handleRefresh = () => {
    setIsMenuOpen(false);
    if (isRefreshing) return;
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 750);
  };

  const handleDownloadTranscript = () => {
    if (messages.length === 0) return;
    let transcript = 'Chat Transcript\n====================\n\n';
    messages.forEach((m) => {
      const role = m.role === 'assistant' ? 'AI' : 'You';
      transcript += `${role}:\n${m.content}\n\n`;
    });
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_transcript_${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  // Open the confirmation modal. The actual end-chat happens in
  // handleConfirmEndChat when the user confirms.
  const handleEndChat = () => {
    setIsMenuOpen(false);
    setIsEndConfirmOpen(true);
  };

  const handleConfirmEndChat = () => {
    endChat();
    setIsEndConfirmOpen(false);
  };

  const handleCancelEndChat = () => {
    setIsEndConfirmOpen(false);
  };

  const handleStartNewChat = () => {
    startNewChat();
  };

  return (
    <div
      className="chat-panel flex flex-col h-full bg-[#111118] relative"
      role="dialog"
      aria-label="Chat support"
      aria-modal="true"
    >
      <div className="chat-header relative">
        <div className="flex items-center gap-3">
          <div className="chat-avatar overflow-hidden">
            <img src="/ani.jpg" alt="Ani" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Ani</h2>
            <p className="text-[11px] text-white/50">
              {!profileSubmitted
                ? 'Welcome'
                : mode === 'post-purchase'
                ? 'Onboarding Assistant'
                : 'Course Assistant'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="More options"
              title="More options"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E2E] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white"
                >
                  <MessageSquarePlus className="h-4 w-4 text-white/60" />
                  New chat
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button
                  onClick={handleRefresh}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white"
                >
                  <RefreshCw className="h-4 w-4 text-white/60" />
                  Refresh
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button
                  onClick={handleDownloadTranscript}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors text-white"
                >
                  <Download className="h-4 w-4 text-white/60" />
                  Download transcript
                </button>
                <div className="h-px bg-white/5 w-full" />
                <button
                  onClick={handleEndChat}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 transition-colors text-red-500"
                >
                  <XCircle className="h-4 w-4" />
                  End chat
                </button>
              </div>
            )}
          </div>

          <button
            onClick={closeChat}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!profileSubmitted ? (
        <PreChatForm />
      ) : (
        <>
          <div className="chat-messages flex-1 overflow-y-auto relative">
            {isRefreshing && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#111118]/85 backdrop-blur-sm">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" strokeWidth={2.25} />
              </div>
            )}
            {showWelcome && !hasMessages && !chatEnded && <WelcomeCard />}
            {hasMessages && <MessageList />}
            {!hasMessages && !chatEnded && <SuggestedChips />}

            {chatEnded && (
              <div className="flex items-center gap-3 px-4 my-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-white/40 whitespace-nowrap">
                  The chat has ended
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {chatEnded ? (
            <div className="shrink-0 p-4 border-t border-white/5 bg-[#111118]">
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-[0.98]"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Start new chat
              </button>
            </div>
          ) : (
            <ChatInput />
          )}
        </>
      )}

      {/* End-chat confirmation modal */}
      {isEndConfirmOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={handleCancelEndChat}
        >
          <div
            className="w-[88%] max-w-[320px] rounded-2xl bg-[#1E1E2E] border border-white/10 p-5 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="end-chat-title"
            aria-describedby="end-chat-desc"
          >
            <h3 id="end-chat-title" className="text-center text-base font-semibold text-white mb-1.5">
              End Chat
            </h3>
            <p id="end-chat-desc" className="text-center text-xs text-white/60 mb-5">
              Are you sure you want to end this chat?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirmEndChat}
                className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                End chat
              </button>
              <button
                onClick={handleCancelEndChat}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
