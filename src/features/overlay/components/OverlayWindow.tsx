import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranscriptStore, ChatMessage } from '../../../stores/transcript-store'
import { useTranscription } from '../../../hooks/useTranscription'
import {
  Mic, MicOff, ChevronUp, ChevronDown, X,
  Sparkles, ArrowUpRight, Send
} from 'lucide-react'

type OverlayMode = 'pill' | 'panel'
const CHAT_WS_BASE = 'ws://127.0.0.1:8000/ws/chat'

export default function OverlayWindow() {
  const [mode, setMode] = useState<OverlayMode>('pill')
  const [chatInput, setChatInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatWsRef = useRef<WebSocket | null>(null)
  const conversationIdRef = useRef(crypto.randomUUID())

  const {
    segments, partialText, aiAnswer, isRecording, status,
    chatMessages, chatStreaming,
    addChatMessage, setChatStreaming, appendChatStreamingToken,
  } = useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()

  // Auto-scroll when content arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [segments, aiAnswer, partialText, chatMessages, chatStreaming])

  // Connect chat WebSocket
  useEffect(() => {
    const ws = new WebSocket(`${CHAT_WS_BASE}/${conversationIdRef.current}`)
    chatWsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'token') {
          appendChatStreamingToken(data.content)
        } else if (data.type === 'done') {
          const streaming = useTranscriptStore.getState().chatStreaming
          if (streaming) {
            addChatMessage({
              id: crypto.randomUUID(),
              role: 'assistant',
              content: streaming,
              timestamp: Date.now(),
            })
          }
          setChatStreaming('')
        }
      } catch (err) {
        console.error('Failed to parse chat WS message:', err)
      }
    }

    ws.onerror = () => console.error('Chat WebSocket error')
    ws.onclose = () => {}

    return () => { ws.close() }
  }, [])

  // Listen for mode changes from main process
  useEffect(() => {
    window.electronAPI?.overlay?.onModeChange?.((incoming) => {
      setMode(incoming)
      if (incoming === 'pill') window.electronAPI?.overlay?.resize('pill')
    })
  }, [])

  // Auto-collapse back to pill after 30s of no new content
  const scheduleAutoCollapse = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
    collapseTimerRef.current = setTimeout(() => {
      // Don't collapse if user is actively typing (input is focused)
      const activeEl = document.activeElement
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      if (isTyping) {
        // Reschedule — user is still interacting
        scheduleAutoCollapse()
        return
      }
      setMode('pill')
      window.electronAPI?.overlay?.resize('pill')
    }, 30000)
  }, [])

  // Cancel auto-collapse when user is actively typing in the input
  const onInputFocus = useCallback(() => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
  }, [])

  const onInputBlur = useCallback(() => {
    // Restart auto-collapse after blur if in panel mode
    if (mode === 'panel') scheduleAutoCollapse()
  }, [mode, scheduleAutoCollapse])

  // When new AI answer arrives, expand automatically
  useEffect(() => {
    if (aiAnswer) {
      setMode('panel')
      window.electronAPI?.overlay?.resize('panel')
      scheduleAutoCollapse()
    }
  }, [aiAnswer, scheduleAutoCollapse])

  // ESC key to close overlay / collapse to pill
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'panel') {
          setMode('pill')
          window.electronAPI?.overlay?.resize('pill')
        } else {
          window.electronAPI?.window?.hideOverlay?.()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode])

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const toggleMode = () => {
    const next: OverlayMode = mode === 'pill' ? 'panel' : 'pill'
    setMode(next)
    window.electronAPI?.overlay?.resize(next)
    if (next === 'panel') scheduleAutoCollapse()
    else if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
  }

  const exitMeeting = () => {
    window.electronAPI?.meeting?.exit?.()
  }

  const sendChatMessage = () => {
    const text = chatInput.trim()
    if (!text) return
    if (chatWsRef.current?.readyState !== WebSocket.OPEN) return

    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })

    chatWsRef.current.send(JSON.stringify({ type: 'message', content: text }))
    setChatInput('')
    setChatStreaming('')

    // Expand panel to show response
    setMode('panel')
    window.electronAPI?.overlay?.resize('panel')
    scheduleAutoCollapse()
  }

  // Most recent AI sentence (for pill preview)
  const aiPreview = aiAnswer
    ? aiAnswer.split('\n').filter(Boolean).pop()?.slice(0, 60) + (aiAnswer.length > 60 ? '…' : '')
    : null

  return (
    <div className="w-full h-full flex flex-col" style={{ userSelect: 'none' }}>

      {/* ─── PILL BAR (always visible) ─────────────────────────────── */}
      <div
        className="drag-region flex items-center gap-2 px-3 h-[56px] rounded-2xl
          bg-[#0f0f11]/90 backdrop-blur-xl border border-white/10 shadow-2xl
          flex-shrink-0 overflow-hidden"
      >
        {/* Logo dot */}
        <div className="no-drag flex items-center gap-2 shrink-0">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            isRecording ? 'bg-red-500 animate-pulse' : 'bg-white/20'
          }`} />
        </div>

        {/* AI preview text (pill mode) */}
        <div className="flex-1 min-w-0 no-drag">
          {aiPreview && mode === 'pill' ? (
            <p className="text-[11px] text-white/60 truncate leading-tight">
              <span className="text-green-400/80 font-medium">AI: </span>{aiPreview}
            </p>
          ) : partialText && mode === 'pill' ? (
            <p className="text-[11px] text-white/40 italic truncate leading-tight">
              {partialText.slice(-60)}
              <span className="inline-block w-[1.5px] h-3 bg-white/40 animate-pulse ml-0.5 align-middle" />
            </p>
          ) : (
            <p className="text-[11px] text-white/25">
              {isRecording ? status || 'Listening…' : 'Avelyn  ·  ⌘⇧M to exit'}
            </p>
          )}
        </div>

        {/* Controls — no-drag */}
        <div className="no-drag flex items-center gap-1 shrink-0">
          {/* Mic toggle */}
          <button
            onClick={toggleRecording}
            title={isRecording ? 'Stop' : 'Start recording'}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10'
            }`}
          >
            {isRecording
              ? <MicOff className="w-3.5 h-3.5" />
              : <Mic className="w-3.5 h-3.5" />
            }
          </button>

          {/* Expand / collapse */}
          <button
            onClick={toggleMode}
            title={mode === 'pill' ? 'Expand' : 'Collapse'}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
          >
            {mode === 'pill'
              ? <ChevronUp className="w-3.5 h-3.5" />
              : <ChevronDown className="w-3.5 h-3.5" />
            }
          </button>

          {/* Back to dashboard */}
          <button
            onClick={exitMeeting}
            title="Back to dashboard (⌘⇧M)"
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── PANEL (expanded content) ──────────────────────────────── */}
      <AnimatePresence>
        {mode === 'panel' && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="flex-1 mt-2 rounded-2xl overflow-hidden flex flex-col
              bg-[#0f0f11]/92 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            {/* Panel header */}
            <div className="drag-region flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Live Assist</span>
              <button
                onClick={toggleMode}
                className="no-drag w-6 h-6 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Scrollable content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">

              {/* Empty state */}
              {segments.length === 0 && !partialText && !aiAnswer && chatMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white/15" />
                  </div>
                  <p className="text-[11px] text-white/25 leading-relaxed">
                    Press mic to capture audio,<br />or type a question below.
                  </p>
                </div>
              )}

              {/* Transcription segments (last 3 only) */}
              {segments.slice(-3).map((seg) => (
                <div key={seg.id} className="space-y-1">
                  <span className="text-[9px] font-semibold text-white/25 uppercase tracking-wider">
                    {seg.speakerLabel}
                  </span>
                  <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                    <p className="text-[12px] text-white/65 leading-relaxed">{seg.content}</p>
                  </div>
                </div>
              ))}

              {/* Partial live text */}
              {partialText && (
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-white/20 uppercase tracking-wider">
                    Listening…
                  </span>
                  <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.03]">
                    <p className="text-[12px] text-white/40 italic leading-relaxed">
                      {partialText}
                      <span className="inline-block w-[1.5px] h-3 bg-white/30 animate-pulse ml-0.5 align-middle" />
                    </p>
                  </div>
                </div>
              )}

              {/* AI Answer from transcription */}
              {aiAnswer && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-green-400/70" />
                    <span className="text-[9px] font-semibold text-green-400/70 uppercase tracking-wider">Suggested Answer</span>
                  </div>
                  <div className="px-3 py-2.5 rounded-xl bg-green-500/[0.07] border border-green-500/[0.12]">
                    <p className="text-[12px] text-white/85 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="space-y-1">
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${
                    msg.role === 'user' ? 'text-blue-400/70' : 'text-green-400/70'
                  }`}>
                    {msg.role === 'user' ? 'You' : 'Avelyn'}
                  </span>
                  <div className={`px-3 py-2 rounded-xl border ${
                    msg.role === 'user'
                      ? 'bg-blue-500/[0.07] border-blue-500/[0.12]'
                      : 'bg-green-500/[0.07] border-green-500/[0.12]'
                  }`}>
                    <p className="text-[12px] text-white/85 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Streaming chat response */}
              {chatStreaming && (
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-green-400/70 uppercase tracking-wider">Avelyn</span>
                  <div className="px-3 py-2.5 rounded-xl bg-green-500/[0.07] border border-green-500/[0.12]">
                    <p className="text-[12px] text-white/85 leading-relaxed whitespace-pre-wrap">
                      {chatStreaming}
                      <span className="inline-block w-[1.5px] h-3 bg-green-400/50 animate-pulse ml-0.5 align-middle" />
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div className="px-3 py-2 border-t border-white/[0.05]">
              <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendChatMessage()
                    }
                  }}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                  placeholder="Ask a question…"
                  className="flex-1 bg-transparent text-[12px] text-white/80 placeholder:text-white/25 outline-none"
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim()}
                  className="w-6 h-6 rounded-full flex items-center justify-center bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Panel footer hint */}
            <div className="px-4 py-2 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[9px] text-white/20">ESC collapse  ·  ⌘⇧M dashboard</span>
              {isRecording && (
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-red-400/70">Recording</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
