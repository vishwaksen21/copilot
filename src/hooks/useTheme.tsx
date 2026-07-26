import { useEffect, useRef, ReactNode } from 'react'
import { useAppStore } from '../stores/app-store'

type Theme = 'light' | 'dark' | 'system'

export function ThemeProvider({ children }: { children: ReactNode }) {
  useTheme()
  return <>{children}</>
}

export function useTheme() {
  const { theme, setTheme } = useAppStore()
  const rootRef = useRef(document.documentElement)

  useEffect(() => {
    const root = rootRef.current

    // Remove all theme classes
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = rootRef.current
      root.classList.remove('light', 'dark')
      root.classList.add(mediaQuery.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Load theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved) {
      setTheme(saved)
    }
  }, [])

  return { theme, setTheme }
}
