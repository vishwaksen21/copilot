import { useState } from 'react'
import { cn } from '../../lib/utils'
import { useTranscriptStore } from '../../stores/transcript-store'
import { useTranscription } from '../../hooks/useTranscription'
import LiveBadge from '../ui/glass/LiveBadge'
import AudioVisualizer from '../ui/glass/AudioVisualizer'
import {
  Mic,
  MicOff,
  Settings,
  HelpCircle,
  EyeOff,
  X,
  Brain,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  BarChart3,
} from 'lucide-react'

interface FloatingToolbarProps {
  onNavigate?: (direction: 'prev' | 'next') => void
  currentPage?: number
  totalPages?: number
}

export default function FloatingToolbar({
  onNavigate,
  currentPage = 1,
  totalPages = 3,
}: FloatingToolbarProps) {
  const [hovering, setHovering] = useState(false)
  const { isRecording, audioLevel } = useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const hideOverlay = () => {
    window.electronAPI?.window?.hideOverlay()
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 drag-region">
      <div
        className={cn(
          'glass-toolbar rounded-full px-2 py-1.5',
          'flex items-center gap-0.5',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'transition-all duration-300',
          hovering && 'shadow-[0_12px_48px_rgba(0,0,0,0.5)]'
        )}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Logo + Name */}
        <div className="no-drag flex items-center gap-2 pl-3 pr-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_10px_rgba(139,92,246,0.25)]">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-foreground/80 tracking-tight">
            Avelyn
          </span>
        </div>

        {/* Counter */}
        <div className="no-drag px-2 py-1 rounded-full bg-white/5">
          <span className="text-[11px] font-mono text-foreground/40 tabular-nums">6</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-white/8 mx-1" />

        {/* Live Badge */}
        {isRecording && (
          <div className="no-drag animate-scale-in">
            <LiveBadge />
          </div>
        )}

        {/* Analysis button */}
        <button
          className={cn(
            'no-drag flex items-center gap-1.5 px-3 py-1.5 rounded-full',
            'text-xs font-medium text-foreground/60',
            'hover:bg-white/8 hover:text-foreground/80',
            'transition-all duration-200'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analysis</span>
        </button>

        {/* Audio Visualizer */}
        {isRecording && (
          <div className="no-drag px-1">
            <AudioVisualizer level={audioLevel} barCount={4} />
          </div>
        )}

        {/* Dots / More */}
        <button className="no-drag w-7 h-7 rounded-full flex items-center justify-center text-foreground/40 hover:text-foreground/70 hover:bg-white/8 transition-all duration-200">
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Page Navigation */}
        {onNavigate && (
          <div className="no-drag flex items-center gap-0.5">
            <button
              onClick={() => onNavigate('prev')}
              className="w-6 h-6 rounded-full flex items-center justify-center text-foreground/30 hover:text-foreground/60 hover:bg-white/6 transition-all duration-200"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-foreground/30 font-medium min-w-[20px] text-center tabular-nums">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={() => onNavigate('next')}
              className="w-6 h-6 rounded-full flex items-center justify-center text-foreground/30 hover:text-foreground/60 hover:bg-white/6 transition-all duration-200"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-4 bg-white/8 mx-0.5" />

        {/* Mic Toggle */}
        <button
          onClick={toggleRecording}
          className={cn(
            'no-drag w-7 h-7 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            isRecording
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/6 text-foreground/50 hover:bg-white/10 hover:text-foreground/80'
          )}
          title={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
        </button>

        {/* Settings */}
        <button
          className="no-drag w-7 h-7 rounded-full flex items-center justify-center bg-white/6 text-foreground/40 hover:bg-white/10 hover:text-foreground/70 transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-white/8 mx-0.5" />

        {/* Hide */}
        <button
          onClick={hideOverlay}
          className="no-drag flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-foreground/50 hover:text-foreground/70 hover:bg-white/8 transition-all duration-200"
          title="Hide (ESC)"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Hide</span>
        </button>

        {/* Close */}
        <button
          onClick={() => window.close()}
          className="no-drag w-7 h-7 rounded-full flex items-center justify-center bg-white/6 text-foreground/40 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
