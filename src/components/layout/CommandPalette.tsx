import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../stores/app-store'
import {
  MessageSquare,
  Mic,
  FileText,
  Users,
  Code,
  Video,
  Settings,
  Zap
} from 'lucide-react'

const quickActions = [
  { id: 'chat', icon: MessageSquare, label: 'New Chat', shortcut: '⌘⇧N' },
  { id: 'transcript', icon: Mic, label: 'Start Transcription', shortcut: '⌘⇧T' },
  { id: 'interview', icon: Users, label: 'Mock Interview', shortcut: '⌘⇧M' },
  { id: 'coding', icon: Code, label: 'Code Assistant', shortcut: '⌘⇧C' },
  { id: 'resume', icon: FileText, label: 'Upload Resume', shortcut: '⌘⇧R' },
  { id: 'meeting', icon: Video, label: 'New Meeting', shortcut: '⌘⇧E' },
  { id: 'settings', icon: Settings, label: 'Settings', shortcut: '⌘,' }
]

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { setActiveView } = useAppStore()

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  )

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Zap className="w-5 h-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none"
                  autoFocus
                />
                <kbd className="px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2">
                {filteredActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        setActiveView(action.id as any)
                        setIsOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-left text-foreground">
                        {action.label}
                      </span>
                      <kbd className="px-2 py-0.5 text-xs text-muted-foreground bg-muted rounded">
                        {action.shortcut}
                      </kbd>
                    </button>
                  )
                })}

                {filteredActions.length === 0 && (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    No commands found
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
