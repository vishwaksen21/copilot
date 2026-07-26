import { useEffect, useRef, useCallback } from 'react'
import { useTranscriptStore } from '../stores/transcript-store'

const WS_BASE = 'ws://127.0.0.1:8000/ws'

// Module-level singleton: one WebSocket shared across all hook instances
let sharedWs: WebSocket | null = null
let sharedExpectingAnswer = false

export function useTranscription() {
  const {
    isRecording,
    currentSessionId,
    setRecording,
    setCurrentSessionId,
    addSegment,
    setPartialText,
    setAiAnswer,
    appendAiAnswerToken,
    setAudioLevel,
    setStatus,
  } = useTranscriptStore()

  const startRecording = useCallback(async () => {
    // Don't start if already recording
    if (sharedWs && sharedWs.readyState === WebSocket.OPEN) return

    try {
      const sessionId = crypto.randomUUID()
      setCurrentSessionId(sessionId)

      const ws = new WebSocket(`${WS_BASE}/transcription/${sessionId}`)
      sharedWs = ws

      ws.onopen = () => {
        setRecording(true)
        setStatus('Connected. Starting capture...')
        ws.send(JSON.stringify({ type: 'start', mode: 'server' }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          switch (data.type) {
            case 'status':
              setStatus(data.message)
              break

            case 'partial':
              setPartialText(data.text)
              break

            case 'final':
              addSegment({
                id: crypto.randomUUID(),
                speakerLabel: 'Interviewer',
                content: data.text,
                startTime: 0,
                endTime: 0,
                confidence: data.confidence || 0,
                isFinal: true,
              })
              setPartialText('')
              sharedExpectingAnswer = true
              break

            case 'ai_answer_token':
              if (sharedExpectingAnswer) {
                setAiAnswer('')
                sharedExpectingAnswer = false
              }
              appendAiAnswerToken(data.text)
              break

            case 'ai_answer':
              break

            case 'audio_level':
              setAudioLevel(data.level || 0)
              break

            case 'error':
              setStatus(`Error: ${data.message}`)
              console.error('Server error:', data.message)
              break
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('WebSocket connection failed')
      }

      ws.onclose = () => {
        sharedWs = null
        setRecording(false)
        setStatus('Disconnected')
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      setStatus('Failed to connect')
    }
  }, [setCurrentSessionId, addSegment, setPartialText, setAiAnswer, appendAiAnswerToken, setAudioLevel, setRecording, setStatus])

  const stopRecording = useCallback(() => {
    if (sharedWs?.readyState === WebSocket.OPEN) {
      sharedWs.send(JSON.stringify({ type: 'stop' }))
      sharedWs.close()
    }
    sharedWs = null
    setRecording(false)
    setStatus('Stopped')
  }, [setRecording, setStatus])

  // Cleanup on unmount — only stop if this is the last component using the hook
  useEffect(() => {
    return () => {
      // Only close if no other component will use it
      // Since all instances share sharedWs, the last unmount cleans up
      if (sharedWs?.readyState === WebSocket.OPEN) {
        sharedWs.send(JSON.stringify({ type: 'stop' }))
        sharedWs.close()
      }
      sharedWs = null
    }
  }, [])

  return {
    startRecording,
    stopRecording,
    isRecording,
    currentSessionId,
  }
}
