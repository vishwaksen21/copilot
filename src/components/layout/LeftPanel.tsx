import { useRef, useEffect, useState } from 'react'
import { Mic, MicOff, Sparkles, Users, SendHorizontal } from 'lucide-react'
import { GlassPanel } from '../ui/GlassPanel'
import { useTranscriptStore } from '../../stores/transcript-store'
import { useTranscription } from '../../hooks/useTranscription'

const CHAT_WS_BASE = 'ws://127.0.0.1:8000/ws/chat'

export function LeftPanel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const chatWsRef = useRef<WebSocket | null>(null)
  const conversationIdRef = useRef(crypto.randomUUID())

  const {
    segments, partialText, aiAnswer, isRecording,
    chatMessages, chatStreaming,
    addChatMessage, setChatStreaming, appendChatStreamingToken,
  } = useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [aiAnswer, segments, partialText, chatMessages, chatStreaming])

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  const sendChatMessage = () => {
    const text = input.trim()
    if (!text) return
    if (chatWsRef.current?.readyState !== WebSocket.OPEN) return

    addChatMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    })

    chatWsRef.current.send(JSON.stringify({ type: 'message', content: text }))
    setInput('')
    setChatStreaming('')
  }

  return (
    <GlassPanel variant="card" padding="none" className="flex flex-col h-full border border-white/10 shadow-glass rounded-3xl">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <h2 className="text-[15px] font-semibold text-white/90">AI Assistant</h2>
        {isRecording && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-medium text-red-400 uppercase tracking-wider">Capturing</span>
          </div>
        )}
      </div>

      {/* Content Area — scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

        {/* Empty state */}
        {segments.length === 0 && !isRecording && !aiAnswer && chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary/60" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-white/60">Ready to assist</p>
              <p className="text-xs text-white/30 leading-relaxed">
                Press the mic button to start capturing.<br />
                AI answers appear here in real time.
              </p>
            </div>
          </div>
        )}

        {/* Transcription segments */}
        {segments.map((seg) => (
          <div key={seg.id} className="space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                {seg.speakerLabel}
              </span>
            </div>
            <div className="ml-7 px-4 py-2.5 rounded-2xl rounded-tl-md bg-white/[0.03] border border-white/[0.04]">
              <p className="text-sm text-white/80 leading-relaxed">{seg.content}</p>
            </div>
          </div>
        ))}

        {/* Partial text (live) */}
        {partialText && (
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                <Mic className="w-2.5 h-2.5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">Listening...</span>
            </div>
            <div className="ml-7 px-4 py-2.5 rounded-2xl rounded-tl-md bg-primary/[0.04] border border-primary/[0.08]">
              <p className="text-sm text-white/50 italic leading-relaxed">
                {partialText}
                <span className="inline-block w-[2px] h-4 bg-primary/60 animate-pulse ml-1 align-middle" />
              </p>
            </div>
          </div>
        )}

        {/* AI Answer from transcription */}
        {aiAnswer && (
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-success" />
              </div>
              <span className="text-[10px] font-semibold text-success/70 uppercase tracking-wider">Suggested Answer</span>
            </div>
            <div className="ml-7 px-4 py-3 rounded-2xl rounded-tl-md bg-success/[0.06] border border-success/[0.12]">
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {chatMessages.map((msg) => (
          <div key={msg.id} className="space-y-1.5 animate-fade-in">
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${
              msg.role === 'user' ? 'text-blue-400/70' : 'text-success/70'
            }`}>
              {msg.role === 'user' ? 'You' : 'Avelyn'}
            </span>
            <div className={`px-4 py-2.5 rounded-2xl rounded-tl-md border ${
              msg.role === 'user'
                ? 'bg-blue-500/[0.06] border-blue-500/[0.12]'
                : 'bg-success/[0.06] border-success/[0.12]'
            }`}>
              <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Streaming chat response */}
        {chatStreaming && (
          <div className="space-y-1.5 animate-fade-in">
            <span className="text-[10px] font-semibold text-success/70 uppercase tracking-wider">Avelyn</span>
            <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-success/[0.06] border border-success/[0.12]">
              <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
                {chatStreaming}
                <span className="inline-block w-[2px] h-4 bg-success/50 animate-pulse ml-1 align-middle" />
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Input Bar */}
      <div className="p-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-2 px-4 flex items-center gap-3">
          <button
            onClick={toggleRecording}
            title={isRecording ? 'Stop' : 'Start recording'}
            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
            }`}
          >
            {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendChatMessage()
              }
            }}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-white/30 focus:outline-none"
          />

          {input.trim() && (
            <button
              onClick={sendChatMessage}
              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary/80 transition-colors"
            >
              <SendHorizontal className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>
      </div>

    </GlassPanel>
  )
}
