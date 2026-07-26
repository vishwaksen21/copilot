import { create } from 'zustand'

export interface TranscriptSegment {
  id: string
  speakerLabel: string
  content: string
  startTime: number
  endTime: number
  confidence: number
  isFinal: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface TranscriptState {
  isRecording: boolean
  currentSessionId: string | null
  segments: TranscriptSegment[]
  partialText: string
  aiAnswer: string
  audioLevel: number
  status: string
  language: string
  chatMessages: ChatMessage[]
  chatStreaming: string

  // Actions
  setRecording: (recording: boolean) => void
  setCurrentSessionId: (id: string | null) => void
  addSegment: (segment: TranscriptSegment) => void
  setSegments: (segments: TranscriptSegment[]) => void
  setPartialText: (text: string) => void
  setAiAnswer: (text: string) => void
  appendAiAnswerToken: (token: string) => void
  setAudioLevel: (level: number) => void
  setStatus: (status: string) => void
  setLanguage: (language: string) => void
  clearTranscript: () => void
  addChatMessage: (message: ChatMessage) => void
  setChatStreaming: (text: string) => void
  appendChatStreamingToken: (token: string) => void
}

export const useTranscriptStore = create<TranscriptState>((set) => ({
  isRecording: false,
  currentSessionId: null,
  segments: [],
  partialText: '',
  aiAnswer: '',
  audioLevel: 0,
  status: 'Idle',
  language: 'en',
  chatMessages: [],
  chatStreaming: '',

  setRecording: (recording) => set({ isRecording: recording }),
  setCurrentSessionId: (id) => set({ currentSessionId: id }),
  addSegment: (segment) =>
    set((state) => ({ segments: [...state.segments, segment] })),
  setSegments: (segments) => set({ segments }),
  setPartialText: (text) => set({ partialText: text }),
  setAiAnswer: (text) => set({ aiAnswer: text }),
  appendAiAnswerToken: (token) =>
    set((state) => ({ aiAnswer: state.aiAnswer + token })),
  setAudioLevel: (level) => set({ audioLevel: level }),
  setStatus: (status) => set({ status }),
  setLanguage: (language) => set({ language }),
  clearTranscript: () =>
    set({ segments: [], partialText: '', aiAnswer: '', currentSessionId: null }),
  addChatMessage: (message) =>
    set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  setChatStreaming: (text) => set({ chatStreaming: text }),
  appendChatStreamingToken: (token) =>
    set((state) => ({ chatStreaming: state.chatStreaming + token })),
}))
