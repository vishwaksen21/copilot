import { useState, useCallback, useEffect, useRef } from 'react'

interface Notification {
  id: string
  title: string
  description?: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface UseNotificationReturn {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

export function useNotification(): UseNotificationReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = crypto.randomUUID()
      const newNotification = { ...notification, id }
      setNotifications((prev) => [...prev, newNotification])

      // Auto-remove after duration
      const duration = notification.duration || 5000
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    },
    []
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return { notifications, addNotification, removeNotification }
}

// Toast component for notifications
export function Toast({
  notification,
  onRemove
}: {
  notification: Notification
  onRemove: () => void
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const typeStyles = {
    success: 'border-green-500/50 bg-green-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    info: 'border-blue-500/50 bg-blue-500/10'
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        border ${typeStyles[notification.type]}
        rounded-lg p-4 shadow-lg backdrop-blur-sm
        min-w-[300px] max-w-[400px]
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{notification.title}</p>
          {notification.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {notification.description}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onRemove, 300)
          }}
          className="ml-4 text-muted-foreground hover:text-foreground"
        >
          ×
        </button>
      </div>
    </div>
  )
}
