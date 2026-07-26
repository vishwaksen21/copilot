import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

function notify() {
  toastListeners.forEach((l) => l([...toasts]))
}

export function toast(props: { title: string; description?: string; variant?: 'default' | 'destructive' }) {
  const id = Math.random().toString(36).slice(2)
  toasts.push({ id, ...props })
  notify()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 4000)
}

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (t: Toast[]) => setItems(t)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[300px] ${
            t.variant === 'destructive'
              ? 'border-red-500/50 bg-red-950/90 text-red-200'
              : 'border-border bg-background/90 text-foreground'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{t.title}</p>
              {t.description && <p className="text-xs opacity-70 mt-0.5">{t.description}</p>}
            </div>
            <button
              onClick={() => {
                toasts = toasts.filter((x) => x.id !== t.id)
                notify()
              }}
              className="opacity-50 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
