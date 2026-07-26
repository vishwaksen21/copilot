import { ReactNode } from 'react'
import { cn } from '../../../lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function GlassCard({
  children,
  className,
  hover = false,
  padding = 'md',
  onClick,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card',
        paddings[padding],
        hover && 'hover-lift cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
