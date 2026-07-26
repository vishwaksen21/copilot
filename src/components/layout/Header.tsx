import { useAppStore } from '../../stores/app-store'
import { useTheme } from '../../hooks/useTheme'
import {
  Sun,
  Moon,
  Monitor,
  Layers,
  Mic,
  Camera,
  Keyboard,
  Search,
  Bell
} from 'lucide-react'

export default function Header() {
  const { theme } = useAppStore()
  const { setTheme } = useTheme()

  const toggleTheme = () => {
    const themes = ['dark', 'light', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex] as any)
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
        {/* Quick actions */}
        <button
          onClick={() => window.electronAPI?.onTranscriptionToggle?.(() => {})}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Toggle Transcription (⌘⇧T)"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          onClick={() => window.electronAPI?.onScreenshotCapture?.(() => {})}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          title="Screenshot + OCR (⌘⇧S)"
        >
          <Camera className="w-4 h-4" />
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
          {/* Notification badge - shown when there are notifications */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" /> */}
        </button>
      </div>
    </header>
  )
}
