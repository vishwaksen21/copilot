import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../../../stores/chat-store'
import { useChat } from '../../../hooks/useChat'
import { Send, Square, Paperclip, ChevronDown } from 'lucide-react'
import MessageBubble from './MessageBubble'

export default function ChatPanel() {
  const { activeConversationId, messages, isStreaming, streamingContent } = useChatStore()
  const { sendMessage, stopStreaming } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const currentMessages = activeConversationId
    ? messages[activeConversationId] || []
    : []

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentMessages, streamingContent])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleSubmit = () => {
    if (!input.trim() || isStreaming) return
    sendMessage(input.trim())
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {currentMessages.length === 0 && !isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Ask about interview preparation, resume optimization,
              or practice mock interviews.
            </p>
          </div>
        ) : (
          <>
            {currentMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Streaming message */}
            {isStreaming && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamingContent,
                  timestamp: new Date()
                }}
                isStreaming
              />
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          {/* Attachment button */}
          <button
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground mb-0.5"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full resize-none bg-muted border border-border rounded-xl px-4 py-3
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                transition-all duration-200"
            />
          </div>

          {/* Send/Stop button */}
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="p-3 rounded-xl bg-destructive text-destructive-foreground
                hover:bg-destructive/90 transition-colors mb-0.5"
              title="Stop generating"
            >
              <Square className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="p-3 rounded-xl bg-primary text-primary-foreground
                hover:bg-primary/90 transition-colors mb-0.5
                disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message (Enter)"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Model selector */}
        <div className="flex items-center justify-center mt-2">
          <ModelSelector />
        </div>
      </div>
    </div>
  )
}

function ModelSelector() {
  const { selectedModel, selectModel } = useChatStore()
  const [isOpen, setIsOpen] = useState(false)

  const models = [
    { provider: 'openai', name: 'gpt-4o', label: 'GPT-4o' },
    { provider: 'openai', name: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { provider: 'ollama', name: 'llama3.1:8b', label: 'Llama 3.1 (8B)' },
    { provider: 'ollama', name: 'llama3.1:70b', label: 'Llama 3.1 (70B)' },
    { provider: 'ollama', name: 'codellama:34b', label: 'CodeLlama (34B)' }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground
          hover:text-foreground hover:bg-muted rounded-lg transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${
          selectedModel.provider === 'openai' ? 'bg-green-500' : 'bg-blue-500'
        }`} />
        {models.find(
          (m) =>
            m.provider === selectedModel.provider && m.name === selectedModel.name
        )?.label || selectedModel.name}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
            bg-card border border-border rounded-lg shadow-lg py-1 min-w-[200px] z-50">
            {models.map((model) => (
              <button
                key={`${model.provider}-${model.name}`}
                onClick={() => {
                  selectModel(model.provider, model.name)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm
                  hover:bg-accent transition-colors"
              >
                <span className={`w-2 h-2 rounded-full ${
                  model.provider === 'openai' ? 'bg-green-500' : 'bg-blue-500'
                }`} />
                {model.label}
                {model.provider === selectedModel.provider &&
                  model.name === selectedModel.name && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
