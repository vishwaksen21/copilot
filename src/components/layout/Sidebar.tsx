import { useNavigate, useLocation } from 'react-router-dom'
import { useAppStore } from '../../stores/app-store'
import {
  MessageSquare,
  Mic,
  FileText,
  Users,
  Code,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react'

const navItems = [
  { path: '/copilot', icon: Sparkles, label: 'Copilot', highlight: true },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/transcript', icon: Mic, label: 'Transcript' },
  { path: '/resume', icon: FileText, label: 'Resume' },
  { path: '/interview', icon: Users, label: 'Interview' },
  { path: '/coding', icon: Code, label: 'Coding' },
  { path: '/meeting', icon: Video, label: 'Meetings' },
  { path: '/settings', icon: Settings, label: 'Settings' }
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, backendStatus, ollamaStatus } = useAppStore()
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-sidebar-background border-r border-sidebar-border
        transition-all duration-300 z-40 flex flex-col
        ${sidebarOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-14 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-sidebar-foreground whitespace-nowrap">
            Avelyn
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? item.highlight
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'bg-sidebar-accent text-sidebar-primary'
                    : item.highlight
                    ? 'text-primary/70 hover:bg-primary/10 hover:text-primary'
                    : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Status indicators */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-green-500'
                  : backendStatus === 'starting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-muted-foreground">
              Backend: {backendStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                ollamaStatus === 'available' ? 'bg-green-500' : 'bg-gray-500'
              }`}
            />
            <span className="text-muted-foreground">
              Ollama: {ollamaStatus}
            </span>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center h-10 border-t border-sidebar-border
          text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
      >
        {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </aside>
  )
}
