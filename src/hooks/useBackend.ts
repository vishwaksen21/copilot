import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../stores/app-store'

const API_BASE = 'http://127.0.0.1:8000/api/v1'

export function useBackend() {
  const { setBackendStatus, setOllamaStatus } = useAppStore()
  const [isChecking, setIsChecking] = useState(false)

  const checkHealth = useCallback(async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`${API_BASE}/health`, {
        signal: AbortSignal.timeout(5000)
      })
      if (!response.ok) {
        setBackendStatus('disconnected')
        return
      }
      const data = await response.json()

      if (data.status === 'healthy') {
        setBackendStatus('connected')

        // Check Ollama status
        try {
          const ollamaResponse = await fetch(`${API_BASE}/chat/models`)
          const ollamaData = await ollamaResponse.json()
          setOllamaStatus(ollamaData.ollama_available ? 'available' : 'unavailable')
        } catch {
          setOllamaStatus('unavailable')
        }
      } else {
        setBackendStatus('disconnected')
      }
    } catch {
      setBackendStatus('disconnected')
    } finally {
      setIsChecking(false)
    }
  }, [setBackendStatus, setOllamaStatus])

  // Check health on mount and periodically
  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 30000) // Check every 30s
    return () => clearInterval(interval)
  }, [checkHealth])

  // Listen for backend status from Electron
  useEffect(() => {
    if (window.electronAPI?.onBackendStatus) {
      window.electronAPI.onBackendStatus((status) => {
        setBackendStatus(status as any)
      })
    }
  }, [setBackendStatus])

  return { checkHealth, isChecking }
}
