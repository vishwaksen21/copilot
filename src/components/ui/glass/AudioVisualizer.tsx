import { useEffect, useRef } from 'react'
import { cn } from '../../../lib/utils'

interface AudioVisualizerProps {
  level: number
  barCount?: number
  className?: string
  color?: string
}

export default function AudioVisualizer({
  level,
  barCount = 5,
  className,
  color = 'rgba(139, 92, 246, 0.8)',
}: AudioVisualizerProps) {
  const barsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      // Create a wave-like pattern across bars
      const offset = Math.sin((Date.now() / 200) + i * 0.8) * 0.3
      const barLevel = Math.max(0.15, Math.min(1, level + offset))
      bar.style.transform = `scaleY(${barLevel})`
      bar.style.opacity = `${0.4 + barLevel * 0.6}`
    })
  }, [level])

  return (
    <div className={cn('flex items-center gap-[3px] h-4', className)}>
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) barsRef.current[i] = el }}
          className="w-[3px] rounded-full transition-transform duration-100"
          style={{
            height: '100%',
            backgroundColor: color,
            transform: 'scaleY(0.15)',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  )
}
