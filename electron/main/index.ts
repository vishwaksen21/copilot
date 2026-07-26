import { app, BrowserWindow, globalShortcut, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { createMainWindow, createOverlayWindow, enterStealthMode } from './window'
import { startBackend, stopBackend, waitForBackend } from './backend'
import { registerIpcHandlers } from './ipc'
import { setupSecurity } from './security'
import { setupTray } from './tray'
import { registerGlobalShortcuts } from './shortcuts'

let mainWindow: BrowserWindow | null = null
let overlayWindow: BrowserWindow | null = null
let tray: Tray | null = null
let backendProcess: any = null

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

  registerIpcHandlers(mainWindow, overlayWindow)
  registerGlobalShortcuts(getMainWindow, getOverlayWindow)

  tray = setupTray(getMainWindow, getOverlayWindow)

  try {
    backendProcess = await startBackend()
    await waitForBackend('http://127.0.0.1:8000/api/v1/health')
  } catch (err) {
    console.error('Backend failed to start:', err)
  }
  // Always show window regardless of backend status
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
      overlayWindow = createOverlayWindow(mainWindow)
      registerIpcHandlers(mainWindow, overlayWindow)
    } else {
      const win = getMainWindow()
      if (win && !win.isDestroyed()) {
        win.show()
        win.focus()
      }
    }
  })
}).catch(console.error)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
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
