import { useEffect, useRef, useCallback } from 'react'
import { useTranscriptStore } from '../stores/transcript-store'

const WS_BASE = 'ws://127.0.0.1:8000/ws'

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
    clearTranscript,
    setStatus,
  } = useTranscriptStore()

  const wsRef = useRef<WebSocket | null>(null)
  const expectingAnswer = useRef(false)

  const startRecording = useCallback(async () => {
    try {
      const sessionId = crypto.randomUUID()
      setCurrentSessionId(sessionId)

      const ws = new WebSocket(`${WS_BASE}/transcription/${sessionId}`)
      wsRef.current = ws

      ws.onopen = () => {
        setRecording(true)
        setStatus('Connected. Starting capture...')
        ws.send(JSON.stringify({ type: 'start', mode: 'server' }))
      }

      ws.onmessage = (event) => {
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
            // Flag that we're now expecting AI answer tokens
            expectingAnswer.current = true
            break

          case 'ai_answer_token':
            // On first token of new answer, clear previous answer
            if (expectingAnswer.current) {
              setAiAnswer('')
              expectingAnswer.current = false
            }
            appendAiAnswerToken(data.text)
            break

          case 'ai_answer':
            // Final complete AI answer (already built up by tokens)
            break

          case 'audio_level':
            setAudioLevel(data.level || 0)
            break

          case 'error':
            setStatus(`Error: ${data.message}`)
            console.error('Server error:', data.message)
            break
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('WebSocket connection failed')
      }

      ws.onclose = () => {
        setRecording(false)
        setStatus('Disconnected')
      }
    } catch (error) {
      console.error('Failed to start recording:', error)
      setStatus('Failed to connect')
    }
  }, [setCurrentSessionId, addSegment, setPartialText, setAiAnswer, appendAiAnswerToken, setAudioLevel, setRecording, setStatus])

  const stopRecording = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }))
      wsRef.current.close()
    }
    setRecording(false)
    setStatus('Stopped')
  }, [setRecording, setStatus])

  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [])

  return {
    startRecording,
    stopRecording,
    isRecording,
    currentSessionId,
  }
}
