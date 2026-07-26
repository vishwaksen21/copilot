import { useChatStore } from '../../../stores/chat-store'
import { Plus, MessageSquare, Clock, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function ConversationList() {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation
  } = useChatStore()

  const handleNewConversation = async () => {
    // TODO: Call API to create new conversation
    const newConversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      mode: 'general',
      modelProvider: 'ollama',
      modelName: 'llama3.1:8b',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0
    }
    createConversation(newConversation)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5
            bg-primary text-primary-foreground rounded-lg
            hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto py-2">
        {conversations.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversation(conversation.id)}
              className={`w-full flex items-start gap-3 px-4 py-3 mx-2 rounded-lg
                transition-colors text-left
                ${
                  activeConversationId === conversation.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                }`}
              style={{ width: 'calc(100% - 16px)' }}
            >
              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {conversation.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">
                    {format(conversation.updatedAt, 'MMM d, h:mm a')}
                  </span>
                  <span className="text-xs">·</span>
                  <span className="text-xs">{conversation.messageCount} messages</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
