import React, { ReactNode } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: ReactNode
  variant?: 'base' | 'strong' | 'toolbar' | 'card'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, children, variant = 'base', padding = 'md', ...props }, ref) => {
    const variants = {
      base: 'glass',
      strong: 'glass-strong',
      toolbar: 'glass-toolbar',
      card: 'glass-card'
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }

    return (
      <motion.div
        ref={ref}
        className={cn(variants[variant], paddings[padding], className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassPanel.displayName = 'GlassPanel'

export { GlassPanel }
