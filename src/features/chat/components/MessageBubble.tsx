import { Message } from '../../../stores/chat-store'
import { User, Bot } from 'lucide-react'
import MarkdownRenderer from '../../../components/shared/MarkdownRenderer'

interface MessageBubbleProps {
  message: Message
  isStreaming?: boolean
}

export default function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}

      {/* Message content */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={message.content} />
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-foreground/70 cursor-blink ml-0.5" />
            )}
          </div>
        )}

        {/* Metadata */}
        {message.tokensUsed && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <span className="text-xs opacity-60">
              {message.tokensUsed} tokens
            </span>
          </div>
        )}
      </div>

      {/* Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  )
}
