import { create } from 'zustand'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
  tokensUsed?: number
}

export interface Conversation {
  id: string
  title: string
  mode: string
  modelProvider: string
  modelName: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
}

interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  isStreaming: boolean
  streamingContent: string
  selectedModel: { provider: string; name: string }

  // Actions
  setConversations: (conversations: Conversation[]) => void
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: Message) => void
  setMessages: (conversationId: string, messages: Message[]) => void
  startStreaming: () => void
  appendStreamingContent: (token: string) => void
  finishStreaming: (messageId: string, tokensUsed: number) => void
  stopStreaming: () => void
  selectModel: (provider: string, name: string) => void
  createConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  isStreaming: false,
  streamingContent: '',
  selectedModel: { provider: 'ollama', name: 'llama3.1:8b' },

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (id) => set({ activeConversationId: id }),

  addMessage: (conversationId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), message]
      }
    })),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages
      }
    })),

  startStreaming: () => set({ isStreaming: true, streamingContent: '' }),

  appendStreamingContent: (token) =>
    set((state) => ({
      streamingContent: state.streamingContent + token
    })),

  finishStreaming: (messageId, tokensUsed) => {
    const { activeConversationId, streamingContent } = get()
    if (!activeConversationId) return

    const assistantMessage: Message = {
      id: messageId,
      role: 'assistant',
      content: streamingContent,
      timestamp: new Date(),
      tokensUsed
    }

    set((state) => ({
      isStreaming: false,
      streamingContent: '',
      messages: {
        ...state.messages,
        [activeConversationId]: [
          ...(state.messages[activeConversationId] || []),
          assistantMessage
        ]
      }
    }))
  },

  stopStreaming: () => set({ isStreaming: false, streamingContent: '' }),

  selectModel: (provider, name) =>
    set({ selectedModel: { provider, name } }),

  createConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      activeConversationId: conversation.id,
      messages: { ...state.messages, [conversation.id]: [] }
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      )
    }))
}))
