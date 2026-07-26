import ChatPanel from './ChatPanel'
import ConversationList from './ConversationList'
import { useChatStore } from '../../../stores/chat-store'

export default function ChatPage() {
  const { activeConversationId } = useChatStore()

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-72 border-r border-border bg-sidebar-background/50">
        <ConversationList />
      </div>

      {/* Chat panel */}
      <div className="flex-1 min-w-0">
        {activeConversationId ? (
          <ChatPanel />
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  )
}

function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Avelyn
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Your AI-powered interview preparation assistant. Start a new conversation
        to practice interview questions, get resume feedback, or analyze job descriptions.
      </p>

      {/* Quick start cards */}
      <div className="grid grid-cols-2 gap-4 max-w-lg w-full">
        <QuickStartCard
          title="Mock Interview"
          description="Practice with AI interviewer"
          icon="🎯"
        />
        <QuickStartCard
          title="Resume Review"
          description="Get feedback on your resume"
          icon="📄"
        />
        <QuickStartCard
          title="Job Analysis"
          description="Analyze job descriptions"
          icon="💼"
        />
        <QuickStartCard
          title="Code Practice"
          description="Solve DSA problems"
          icon="💻"
        />
      </div>
    </div>
  )
}

function QuickStartCard({
  title,
  description,
  icon
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <button className="flex items-start gap-3 p-4 rounded-xl border border-border
      bg-card hover:bg-accent transition-all duration-200 text-left group">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}
