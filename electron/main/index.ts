import { app, BrowserWindow, globalShortcut, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createMainWindow, createOverlayWindow, getStealthMode } from './window'
import { startBackend, stopBackend } from './backend'
import { registerIpcHandlers, updateIpcWindows } from './ipc'
import { setupSecurity } from './security'
import { setupTray } from './tray'
import { registerGlobalShortcuts } from './shortcuts'

let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null
let backendProcess: any = null
let ipcRegistered = false

function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

function getOverlayWindow(): BrowserWindow | null {
  return overlayWindow
}

function destroyTray(): void {
  if (tray && !tray.isDestroyed()) {
    tray.destroy()
  }
  tray = null
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.avelyn.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  setupSecurity()

  mainWindow = createMainWindow()
  overlayWindow = createOverlayWindow(mainWindow)

  if (!ipcRegistered) {
    registerIpcHandlers(mainWindow, overlayWindow)
    ipcRegistered = true
  }
  registerGlobalShortcuts(getMainWindow, getOverlayWindow)

  tray = setupTray(getMainWindow, getOverlayWindow)

  // Show window immediately — don't wait for backend
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
  }

  // Start backend in background (non-blocking)
  startBackend()
    .then((proc) => {
      backendProcess = proc
    })
    .catch((err) => {
      console.error('[Backend] Failed to start:', err)
    })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
      overlayWindow = createOverlayWindow(mainWindow)
      // Update mutable references in ipc.ts — handlers survive window recreation
      updateIpcWindows(mainWindow, overlayWindow)
    } else {
      const win = getMainWindow()
      if (win && !win.isDestroyed()) {
        win.show()
        win.focus()
      }
    }
  })
}).catch(console.error)

// Don't quit when all windows are hidden (stealth mode)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && !getStealthMode()) {
    // On Windows, don't quit if any BrowserWindow still exists (even if hidden)
    // This prevents the app from dying when the main window is hidden but overlay is active
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length === 0) {
      app.quit()
    }
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  destroyTray()
  if (backendProcess) {
    stopBackend(backendProcess)
  }
})

process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection:', err)
})
