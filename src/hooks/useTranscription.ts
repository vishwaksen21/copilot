import { useEffect, useRef, useCallback } from 'react'
import { useTranscriptStore } from '../stores/transcript-store'

const WS_BASE = 'ws://127.0.0.1:8000/ws'
const RECONNECT_DELAY = 2000
const MAX_RECONNECT_ATTEMPTS = 5

// Module-level singleton: one WebSocket shared across all hook instances
let sharedWs: WebSocket | null = null
let sharedExpectingAnswer = false
let sharedRecording = false
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let refCount = 0

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

  const connectWs = useCallback((sessionId: string) => {
    if (sharedWs && sharedWs.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(`${WS_BASE}/transcription/${sessionId}`)
      sharedWs = ws

      ws.onopen = () => {
        reconnectAttempts = 0
        sharedRecording = true
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
        // Only show disconnected if we weren't intentionally stopped
        if (sharedRecording) {
          setStatus('Connection lost. Reconnecting...')
          // Auto-reconnect with exponential backoff
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++
            const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1)
            reconnectTimer = setTimeout(() => {
              if (sharedRecording) {
                connectWs(sessionId)
              }
            }, delay)
          } else {
            sharedRecording = false
            setRecording(false)
            setStatus('Connection lost. Click mic to retry.')
          }
        }
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      setStatus('Failed to connect')
    }
  }, [setCurrentSessionId, addSegment, setPartialText, setAiAnswer, appendAiAnswerToken, setAudioLevel, setRecording, setStatus])

  const startRecording = useCallback(async () => {
    // Don't start if already recording
    if (sharedWs && sharedWs.readyState === WebSocket.OPEN) return

    // Cancel any pending reconnect
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    reconnectAttempts = 0
    const sessionId = crypto.randomUUID()
    setCurrentSessionId(sessionId)
    connectWs(sessionId)
  }, [connectWs, setCurrentSessionId])

  const stopRecording = useCallback(() => {
    // Cancel any pending reconnect
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }

    sharedRecording = false
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS // prevent reconnect

    if (sharedWs?.readyState === WebSocket.OPEN) {
      sharedWs.send(JSON.stringify({ type: 'stop' }))
      sharedWs.close()
    }
    sharedWs = null
    setRecording(false)
    setStatus('Stopped')
  }, [setRecording, setStatus])

  // Ref counting — only clean up when last consumer unmounts
  useEffect(() => {
    refCount++
    return () => {
      refCount--
      if (refCount === 0 && sharedRecording) {
        // Last consumer unmounted while recording — stop cleanly
        stopRecording()
      }
    }
  }, [stopRecording])

  return {
    startRecording,
    stopRecording,
    isRecording,
    currentSessionId,
  }
}
