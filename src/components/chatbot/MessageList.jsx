import { useChatStore } from '../../store/chatStore';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export default function MessageList() {
  const { messages, isLoading } = useChatStore();

  const lastMessage = messages[messages.length - 1];
  const isWaitingForFirstToken =
    isLoading && lastMessage?.role === 'assistant' && !lastMessage.content;

  const visibleMessages = isWaitingForFirstToken ? messages.slice(0, -1) : messages;

  return (
    <div
      className="flex flex-col gap-3 px-4 py-3"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {visibleMessages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isWaitingForFirstToken && <TypingIndicator />}
    </div>
  );
}
