import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';
import { trimConversationHistory } from '../../lib/chatUtils';
import toast from 'react-hot-toast';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const {
    addMessage,
    updateLastAssistantMessage,
    setLoading,
    isLoading,
    messages,
    mode,
    userProfile,
    dismissWelcome,
  } = useChatStore();

  const MAX_CHARS = 600;
  const SHOW_COUNTER_AT = 500;

  const handleSend = useCallback(async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    dismissWelcome();
    setInput('');

    addMessage({ role: 'user', content: trimmedInput });

    const allMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: trimmedInput },
    ];

    const trimmedMessages = trimConversationHistory(allMessages);

    addMessage({ role: 'assistant', content: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: trimmedMessages,
          mode,
          userProfile,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Something went wrong. Please try again.';

        toast.error(
          response.status === 429 ? 'Too many messages. Please wait a moment.' : errorMessage,
          {
            style: {
              background: '#1E1E2E',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }
        );

        updateLastAssistantMessage(
          "I'm having trouble connecting right now. Please try again, or reach out to our WhatsApp community for immediate help."
        );
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  fullContent += parsed.delta;
                  updateLastAssistantMessage(fullContent);
                }
                if (parsed.error) {
                  toast.error(parsed.error, {
                    style: {
                      background: '#1E1E2E',
                      color: '#fff',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                    },
                  });
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch {
      toast.error('Network error. Please check your connection.', {
        style: {
          background: '#1E1E2E',
          color: '#fff',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
      updateLastAssistantMessage(
        "I'm having trouble connecting right now. Please try again, or reach out to our WhatsApp community for immediate help."
      );
    } finally {
      setLoading(false);
    }
  }, [
    input,
    isLoading,
    messages,
    mode,
    userProfile,
    addMessage,
    updateLastAssistantMessage,
    setLoading,
    dismissWelcome,
  ]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInput(value);
    }
  };

  return (
    <div className="chat-input-container">
      <div className="relative flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about The Organic Buzz course…"
          disabled={isLoading}
          rows={2}
          className="chat-input"
          aria-label="Type your message"
          id="chatbot-input"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="chat-send-button"
          aria-label="Send message"
          id="chatbot-send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      {input.length >= SHOW_COUNTER_AT && (
        <div className="mt-1 text-right text-[10px] text-white/30">
          {input.length}/{MAX_CHARS}
        </div>
      )}
    </div>
  );
}
