import { session } from 'electron'
import { is } from '@electron-toolkit/utils'

export function setupSecurity(): void {
  // In dev mode, don't apply CSP — Vite dev server needs relaxed policy for HMR
  if (is.dev) return

  // Set Content Security Policy (production only)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://127.0.0.1:* http://127.0.0.1:* http://localhost:*; img-src 'self' data: blob:; font-src 'self' data:"
        ]
      }
    })
  })

  // Prevent new window creation (via webContents handler set per-window)
}
