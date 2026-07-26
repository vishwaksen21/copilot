import React, { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/utils'

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'ref'> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  active?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'glass', size = 'md', active, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow-glow-primary hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      glass: 'bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md',
      ghost: 'hover:bg-white/10 hover:text-white',
      danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:shadow-glow-red'
    }

    const activeStyles = {
      primary: 'bg-primary shadow-glow-primary',
      secondary: 'bg-secondary',
      glass: 'bg-white/15 border-white/20',
      ghost: 'bg-white/10',
      danger: 'bg-destructive/20 shadow-glow-red'
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-8 text-base',
      icon: 'h-10 w-10'
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          active && activeStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
