import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// How long a restored transcript may be replayed to the model. Anything older
// is dropped on rehydrate: the visitor still gets a fresh chat, but a price or
// policy answered weeks ago can no longer be fed back as current context.
const TRANSCRIPT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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
  // Bump this whenever stored transcripts could contain facts that have since
  // changed — a price, a module count, a policy. Bumping DROPS every stored
  // transcript so no browser can replay an out-of-date answer back into the
  // model as if it were current. v2: the ₹7,999 → ₹39,999 price change of
  // 2026-08-18 left correct-at-the-time price answers sitting in visitors'
  // localStorage, and ChatInput replays them to /api/chat on the next visit.
  version: 2,
  migrate: (persisted) => ({
    ...(persisted || {}),
    messages: [],
    chatEnded: false,
  }),
  // Timestamps get JSON-serialized to ISO strings; rehydrate them back to
  // Date objects so getRelativeTime() works without extra wrapping. Messages
  // older than the cutoff are dropped rather than restored: an unbounded
  // transcript is a store of stale facts that gets fed back to the model.
  onRehydrateStorage: () => (state) => {
    if (!state?.messages) return;
    const cutoff = Date.now() - TRANSCRIPT_MAX_AGE_MS;
    state.messages = state.messages
      .map((m) => ({
        ...m,
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      }))
      .filter((m) => m.timestamp.getTime() >= cutoff);
    if (state.messages.length === 0) state.chatEnded = false;
  },
}));
