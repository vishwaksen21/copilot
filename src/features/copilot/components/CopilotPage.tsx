import { useState, useRef, useEffect } from 'react'
import { cn } from '../../../lib/utils'
import { useTranscriptStore } from '../../../stores/transcript-store'
import { useTranscription } from '../../../hooks/useTranscription'
import GlassCard from '../../../components/ui/glass/GlassCard'
import AudioVisualizer from '../../../components/ui/glass/AudioVisualizer'
import FloatingToolbar from '../../../components/layout/FloatingToolbar'
import {
  Mic,
  MicOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
  Volume2,
  Sun,
  Users,
  Clock,
  MessageSquare,
  Monitor,
  Circle,
  Smile,
} from 'lucide-react'

export default function CopilotPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [brightness, setBrightness] = useState(0.8)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const { segments, partialText, aiAnswer, audioLevel, isRecording, status } =
    useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [aiAnswer, segments, partialText])

  const handleNavigate = (dir: 'prev' | 'next') => {
    setCurrentPage((p) => (dir === 'prev' ? Math.max(1, p - 1) : Math.min(3, p + 1)))
  }

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="app-background" />

      {/* Floating Toolbar */}
      <FloatingToolbar
        onNavigate={handleNavigate}
        currentPage={currentPage}
        totalPages={3}
      />

      {/* Main Content — two panels */}
      <div className="relative z-10 flex h-full pt-20 pb-6 px-6 gap-5">

        {/* ═══════ LEFT PANEL: AI Assistant ═══════ */}
        <GlassCard padding="none" className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground/90">AI Assistant</h2>
            {isRecording && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">
                  Capturing
                </span>
              </div>
            )}
          </div>

          {/* AI Response Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {/* Empty state — matching demo.png description style */}
            {segments.length === 0 && !isRecording && !aiAnswer && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-[15px] text-foreground/60 leading-[1.8] font-medium">
                  Avelyn helps candidates prepare for and perform during
                  technical interviews with the power of real-time AI
                  assistance. The platform can analyze coding questions,
                  generate optimized code solutions, explain algorithms, answer
                  conceptual questions, and assist with live discussions
                  instantly.
                </p>
              </div>
            )}

            {/* Transcription segments */}
            {segments.map((seg) => (
              <div key={seg.id} className="space-y-1.5 animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider">
                    {seg.speakerLabel}
                  </span>
                </div>
                <div className="ml-7 px-4 py-2.5 rounded-2xl rounded-tl-md bg-white/[0.03] border border-white/[0.04]">
                  <p className="text-[15px] text-foreground/80 leading-[1.7]">{seg.content}</p>
                </div>
              </div>
            ))}

            {/* Partial text */}
            {partialText && (
              <div className="space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground/30 uppercase tracking-wider">
                    Listening...
                  </span>
                </div>
                <div className="ml-7 px-4 py-2.5 rounded-2xl rounded-tl-md bg-primary/[0.04] border border-primary/[0.08]">
                  <p className="text-[15px] text-foreground/50 italic leading-[1.7]">
                    {partialText}
                    <span className="inline-block w-[2px] h-4 bg-primary/60 cursor-blink ml-1 align-middle" />
                  </p>
                </div>
              </div>
            )}

            {/* AI Answer */}
            {aiAnswer && (
              <div className="space-y-1.5 animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-success" />
                  </div>
                  <span className="text-[10px] font-semibold text-success/70 uppercase tracking-wider">
                    Suggested Answer
                  </span>
                </div>
                <div className="ml-7 px-5 py-4 rounded-2xl rounded-tl-md bg-success/[0.06] border border-success/[0.12]">
                  <p className="text-[15px] text-foreground/90 leading-[1.8] whitespace-pre-wrap">
                    {aiAnswer}
                    {isRecording && (
                      <span className="inline-block w-[2px] h-4 bg-success/60 cursor-blink ml-1 align-middle" />
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) setInput('')
                  }}
                  placeholder="How can I help you today?"
                  className={cn(
                    'w-full px-5 py-3 rounded-2xl',
                    'bg-white/[0.04] border border-white/[0.06]',
                    'text-sm text-foreground/80 placeholder:text-foreground/25',
                    'focus:outline-none focus:border-primary/30 focus:bg-white/[0.06]',
                    'transition-all duration-200'
                  )}
                />
              </div>
              <button
                onClick={toggleRecording}
                className={cn(
                  'w-11 h-11 rounded-2xl flex items-center justify-center',
                  'transition-all duration-200',
                  isRecording
                    ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-glow-pulse'
                    : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                )}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* ═══════ RIGHT PANEL: Meeting Preview ═══════ */}
        <div className="w-[480px] flex flex-col gap-4 shrink-0">
          {/* Video Container */}
          <GlassCard padding="none" className="flex-1 flex flex-col">
            {/* Video Area */}
            <div className="flex-1 relative rounded-t-3xl overflow-hidden bg-black/40 min-h-[300px]">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: brightness }}
              >
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                    <Video className="w-8 h-8 text-foreground/15" />
                  </div>
                  <p className="text-xs text-foreground/20">
                    {isRecording ? 'Capturing meeting audio' : 'Meeting preview'}
                  </p>
                </div>
              </div>

              {/* Brightness Slider */}
              <div className="absolute top-4 right-4 no-drag">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                  <Sun className="w-3 h-3 text-foreground/40" />
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-16 h-1 accent-primary/60 bg-white/10 rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80"
                  />
                </div>
              </div>

              {/* Waveform */}
              {isRecording && (
                <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                  <div className="flex items-end justify-center gap-[2px] h-8 opacity-40">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-[2px] bg-primary/60 rounded-full"
                        style={{
                          height: `${Math.max(3, Math.sin(i * 0.5 + Date.now() / 300) * audioLevel * 24 + 3)}px`,
                          transition: 'height 100ms ease',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meeting Controls Bar — matching demo.png */}
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-center gap-1">
              {[
                { icon: Users, label: 'Participants' },
                { icon: MessageSquare, label: 'Chat' },
                { icon: Monitor, label: 'Screen Sharing' },
                {
                  icon: Circle,
                  label: 'Recording',
                  active: isRecording,
                  onClick: toggleRecording,
                  activeColor: 'text-red-400',
                },
                { icon: Smile, label: 'Reactions' },
              ].map(({ icon: Icon, label, active, onClick, activeColor }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl',
                    'text-[10px] font-medium transition-all duration-200',
                    active
                      ? `${activeColor || 'text-primary'} bg-white/[0.06]`
                      : 'text-foreground/35 hover:text-foreground/60 hover:bg-white/[0.04]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="whitespace-nowrap">{label}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard padding="sm" className="shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleRecording}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl',
                  'text-xs font-medium transition-all duration-200',
                  isRecording
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'bg-white/[0.04] text-foreground/50 border border-white/[0.06] hover:bg-white/[0.07]'
                )}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isRecording ? 'Stop Mic' : 'Start Mic'}
              </button>
              <button
                onClick={() => window.electronAPI?.window?.hideOverlay()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] text-foreground/50 border border-white/[0.06] hover:bg-white/[0.07] transition-all duration-200"
              >
                <Video className="w-3.5 h-3.5" />
                Hide
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
