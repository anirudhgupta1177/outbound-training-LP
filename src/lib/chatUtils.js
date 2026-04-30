export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function trimConversationHistory(messages, maxTokens = 12000) {
  const totalTokens = messages.reduce(
    (sum, msg) => sum + estimateTokens(msg.content),
    0
  );

  if (totalTokens <= maxTokens) {
    return messages;
  }

  const minKeep = 6;
  if (messages.length <= minKeep) {
    return messages;
  }

  const keepFromEnd = Math.max(minKeep, Math.floor(messages.length / 2));
  const trimmed = messages.slice(-keepFromEnd);
  const droppedCount = messages.length - keepFromEnd;
  const summaryMessage = {
    role: 'user',
    content: `[Earlier conversation: ${droppedCount} messages were summarized to save context. The conversation has been ongoing about the DFY Cold Email Machine.]`,
  };

  return [summaryMessage, ...trimmed];
}

export function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}
