import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
type ViewType = 'chat' | 'transcript' | 'resume' | 'interview' | 'coding' | 'meeting' | 'settings'

interface AppState {
  theme: Theme
  sidebarOpen: boolean
  activeView: ViewType
  backendStatus: 'connected' | 'disconnected' | 'starting'
  ollamaStatus: 'available' | 'unavailable'
  overlayVisible: boolean
  isRecording: boolean
  isMicEnabled: boolean
  isAnalyzing: boolean
  brightness: number
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveView: (view: ViewType) => void
  setBackendStatus: (status: 'connected' | 'disconnected' | 'starting') => void
  setOllamaStatus: (status: 'available' | 'unavailable') => void
  setOverlayVisible: (visible: boolean) => void
  setIsRecording: (recording: boolean) => void
  setIsMicEnabled: (enabled: boolean) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setBrightness: (brightness: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark',
  sidebarOpen: true,
  activeView: 'chat',
  backendStatus: 'starting',
  ollamaStatus: 'unavailable',
  overlayVisible: false,
  isRecording: false,
  isMicEnabled: true,
  isAnalyzing: true,
  brightness: 100,

  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveView: (view) => set({ activeView: view }),
  setBackendStatus: (status) => set({ backendStatus: status }),
  setOllamaStatus: (status) => set({ ollamaStatus: status }),
  setOverlayVisible: (visible) => set({ overlayVisible: visible }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setIsMicEnabled: (enabled) => set({ isMicEnabled: enabled }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setBrightness: (brightness) => set({ brightness })
}))
