import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toolbar } from './Toolbar'

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-window text-foreground font-sans selection:bg-primary/30" style={{ position: 'relative' }}>

      {/* Background decoration layer — pointer-events: none so it never blocks clicks */}
      <div className="app-background" aria-hidden="true" />

      {/* Top Floating Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.main
          key="main-content"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="w-full h-full pt-[108px] pb-[80px] px-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>

    </div>
  )
}
