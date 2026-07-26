import { useState, useCallback, useRef } from 'react'
import { useChatStore } from '../stores/chat-store'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export function useChat() {
  const {
    activeConversationId,
    isStreaming,
    streamingContent,
    selectedModel,
    addMessage,
    startStreaming,
    appendStreamingContent,
    finishStreaming,
    stopStreaming
  } = useChatStore()

  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversationId || isStreaming) return

      // Add user message
      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user' as const,
        content,
        timestamp: new Date()
      }
      addMessage(activeConversationId, userMessage)

      // Start streaming
      startStreaming()

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch(`${API_BASE}/chat/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: activeConversationId,
            content,
            model_provider: selectedModel.provider,
            model_name: selectedModel.name
          }),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) throw new Error('Chat request failed')

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let messageId = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'token') {
                  appendStreamingContent(data.content)
                } else if (data.type === 'done') {
                  messageId = data.message_id
                  finishStreaming(messageId, data.tokens_used)
                } else if (data.type === 'error') {
                  console.error('Stream error:', data.message)
                  stopStreaming()
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Chat error:', error)
        }
        stopStreaming()
      }
    },
    [
      activeConversationId,
      isStreaming,
      selectedModel,
      addMessage,
      startStreaming,
      appendStreamingContent,
      finishStreaming,
      stopStreaming
    ]
  )

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort()
    stopStreaming()
  }, [stopStreaming])

  return {
    sendMessage,
    stopStreaming: handleStop,
    isStreaming,
    streamingContent
  }
}
