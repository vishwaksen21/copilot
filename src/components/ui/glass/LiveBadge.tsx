import { cn } from '../../../lib/utils'

interface LiveBadgeProps {
  className?: string
}

export default function LiveBadge({ className }: LiveBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full',
        'bg-red-500/15 border border-red-500/30',
        'animate-live-pulse',
        className
      )}
    >
      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
      <span className="text-[11px] font-semibold tracking-wider text-red-400 uppercase">
        Live
      </span>
    </div>
  )
}
