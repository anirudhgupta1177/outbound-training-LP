import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessageList() {
  const { messages, isLoading } = useChatStore();

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
    </div>
  );
}
