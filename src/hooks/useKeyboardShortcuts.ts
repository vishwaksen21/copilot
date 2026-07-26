import { useEffect, useRef, useCallback, useState } from 'react'

type ShortcutCallback = () => void

export function useKeyboardShortcuts() {
  const shortcutsRef = useRef<Map<string, ShortcutCallback>>(new Map())

  const register = useCallback((accelerator: string, callback: ShortcutCallback) => {
    shortcutsRef.current.set(accelerator, callback)

    // Register with Electron via preload API
    if (window.electronAPI?.shortcuts) {
      window.electronAPI.shortcuts.register(accelerator, callback)
    }
  }, [])

  const unregister = useCallback((accelerator: string) => {
    shortcutsRef.current.delete(accelerator)

    if (window.electronAPI?.shortcuts) {
      window.electronAPI.shortcuts.unregister(accelerator)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shortcutsRef.current.forEach((_, accelerator) => {
        if (window.electronAPI?.shortcuts) {
          window.electronAPI.shortcuts.unregister(accelerator)
        }
      })
    }
  }, [])

  return { register, unregister }
}
