import { useAppStore } from '../../stores/app-store'
import { useTheme } from '../../hooks/useTheme'
import { useTranscription } from '../../hooks/useTranscription'
import {
  Sun,
  Moon,
  Monitor,
  Layers,
  Mic,
  MicOff,
  Keyboard,
  Search,
  Bell
} from 'lucide-react'

export default function Header() {
  const { theme } = useAppStore()
  const { setTheme } = useTheme()
  const { isRecording, startRecording, stopRecording } = useTranscription()

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex] as any)
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  return (
    <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4">
      {/* Left: Window drag region */}
      <div className="drag-region flex-1 h-full" />

      {/* Center: Search */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-muted rounded-lg max-w-md w-full mx-4">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Search or press ⌘K...
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 no-drag">
        {/* Transcription toggle */}
        <button
          onClick={toggleRecording}
          className={`p-2 rounded-lg hover:bg-muted transition-colors ${
            isRecording ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-foreground'
          }`}
          title={isRecording ? 'Stop Recording (⌘⇧T)' : 'Start Recording (⌘⇧T)'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <button
          onClick={() => window.electronAPI?.window?.showOverlay()}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Toggle Overlay (⌘⇧Space)"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-1" />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
