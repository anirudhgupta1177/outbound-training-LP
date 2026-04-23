import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

let messageCounter = 0;
function generateId() {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

function getDefaultMode() {
  if (typeof window === 'undefined') return 'pre-purchase';
  if (new URLSearchParams(window.location.search).get('mode') === 'client') {
    return 'post-purchase';
  }
  return import.meta.env.VITE_CHATBOT_MODE_DEFAULT || 'pre-purchase';
}

export const useChatStore = create(persist((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,
  mode: getDefaultMode(),
  hasOpenedBefore: false,
  showWelcome: true,
  userProfile: null,
  profileSubmitted: false,
  chatEnded: false,

  toggleChat: () => {
    const state = get();
    set({
      isOpen: !state.isOpen,
      hasOpenedBefore: true,
    });
  },

  openChat: () =>
    set({
      isOpen: true,
      hasOpenedBefore: true,
    }),

  closeChat: () => set({ isOpen: false }),

  addMessage: (message) => {
    const newMessage = {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  updateLastAssistantMessage: (content) => {
    set((state) => {
      const messages = [...state.messages];
      const lastIndex = messages.length - 1;
      if (lastIndex >= 0 && messages[lastIndex].role === 'assistant') {
        messages[lastIndex] = {
          ...messages[lastIndex],
          content,
        };
      }
      return { messages };
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setMode: (mode) => set({ mode }),

  setProfile: (profile) => set({ userProfile: profile }),

  setProfileSubmitted: (submitted) => set({ profileSubmitted: submitted }),

  dismissWelcome: () => set({ showWelcome: false }),

  endChat: () => set({ chatEnded: true, isLoading: false }),

  startNewChat: () => set({ messages: [], chatEnded: false, showWelcome: true }),
}), {
  name: 'chatbot-profile',
  storage: createJSONStorage(() => localStorage),
  // Persist identity + conversation. Ephemeral UI state (isOpen, isLoading,
  // showWelcome, mode) intentionally stays out so each visit starts with
  // the launcher collapsed and no leftover loading spinners.
  partialize: (state) => ({
    userProfile: state.userProfile,
    profileSubmitted: state.profileSubmitted,
    messages: state.messages,
    chatEnded: state.chatEnded,
  }),
  // Timestamps get JSON-serialized to ISO strings; rehydrate them back to
  // Date objects so getRelativeTime() works without extra wrapping.
  onRehydrateStorage: () => (state) => {
    if (!state?.messages) return;
    state.messages = state.messages.map((m) => ({
      ...m,
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
    }));
  },
}));
