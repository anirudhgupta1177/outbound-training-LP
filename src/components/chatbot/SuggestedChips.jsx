import { useChatStore } from '../../store/chatStore';

const PRE_PURCHASE_CHIPS = [
  "What's included?",
  'What does it cost?',
  'How long until results?',
  'Refund policy?',
];

const POST_PURCHASE_CHIPS = [
  'Course timeline',
  'Which module first?',
  'How to get support',
  'Community access',
];

export default function SuggestedChips() {
  const {
    mode,
    userProfile,
    addMessage,
    dismissWelcome,
    setLoading,
    messages,
    updateLastAssistantMessage,
  } = useChatStore();
  const chips = mode === 'post-purchase' ? POST_PURCHASE_CHIPS : PRE_PURCHASE_CHIPS;

  const handleChipClick = async (chip) => {
    dismissWelcome();
    addMessage({ role: 'user', content: chip });

    const allMessages = [
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: chip },
    ];

    addMessage({ role: 'assistant', content: '' });
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, mode, userProfile }),
      });

      if (!response.ok) {
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
              } catch {
                // ignore
              }
            }
          }
        }
      }
    } catch {
      updateLastAssistantMessage(
        "I'm having trouble connecting right now. Please try again, or reach out to our WhatsApp community for immediate help."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pb-2">
      <p className="text-[11px] text-white/40 mb-2 font-medium">Suggested questions</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChipClick(chip)}
            className="suggested-chip"
            aria-label={`Ask: ${chip}`}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
}
