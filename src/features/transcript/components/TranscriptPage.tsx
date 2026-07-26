import { useRef, useEffect } from 'react'
import { useTranscriptStore } from '../../../stores/transcript-store'
import { useTranscription } from '../../../hooks/useTranscription'
import { Mic, MicOff, Download, Search, Clock, User, Circle } from 'lucide-react'

export default function TranscriptPage() {
  const { isRecording, segments, partialText, audioLevel, aiAnswer, status } =
    useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [segments, aiAnswer, partialText])

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h1 className="text-xl font-semibold">Live Transcript</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isRecording ? 'Capturing interview audio via system output' : 'Ready to capture'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
          {segments.length === 0 && !isRecording ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to transcribe
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Click the record button to start capturing interview audio.
                The other person's voice is captured from system audio output.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Requires BlackHole virtual audio device
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {segments.map((segment) => (
                <div key={segment.id} className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {segment.speakerLabel}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(segment.startTime)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(segment.confidence * 100)}%)
                        </span>
                      </div>
                      <p className="text-foreground">{segment.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Partial text */}
              {partialText && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Mic className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground/70 italic">{partialText}</p>
                  </div>
                </div>
              )}

              {/* AI Answer */}
              {aiAnswer && (
                <div className="ml-11 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-1 mb-1">
                    <Circle className="w-1.5 h-1.5 fill-green-500" />
                    <span className="text-xs text-green-500/80 font-medium">Suggested Answer</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {aiAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-6 rounded-full transition-all duration-100 ${
                      i < audioLevel * 10 ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-4 rounded-full transition-all duration-200 ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-primary hover:bg-primary/90 text-primary-foreground'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <div className="text-sm text-muted-foreground min-w-[120px]">
              {status}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
