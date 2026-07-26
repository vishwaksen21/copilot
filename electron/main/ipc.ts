import { app, shell, BrowserWindow, ipcMain, dialog, nativeImage, screen } from 'electron'
import { join } from 'path'
import { IPC_CHANNELS } from '../shared/ipc-channels'
import {
  enterStealthMode,
  exitStealthMode,
  emergencyHide,
  showAll,
  setOverlayClickThrough,
  setOverlayOpacity,
  getStealthMode,
  stealthMode
} from './window'
import { startBackend, stopBackend } from './backend'

const PILL_WIDTH = 320
const PILL_HEIGHT = 56
const PANEL_WIDTH = 380
const PANEL_HEIGHT = 500

export function registerIpcHandlers(
  mainWindow: BrowserWindow,
  overlayWindow: BrowserWindow
): void {
  // ============================================
  // WINDOW MANAGEMENT
  // ============================================

  ipcMain.handle(IPC_CHANNELS.WINDOW_MINIMIZE, () => {
    mainWindow?.minimize()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_MAXIMIZE, () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_CLOSE, () => {
    mainWindow?.close()
  })

  ipcMain.handle(
    IPC_CHANNELS.WINDOW_SET_ALWAYS_ON_TOP,
    (_event, flag: boolean, level?: string) => {
      overlayWindow?.setAlwaysOnTop(flag, (level as any) || 'floating', 1)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.WINDOW_SET_CONTENT_PROTECTION,
    (_event, enabled: boolean) => {
      overlayWindow?.setContentProtection(enabled)
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.WINDOW_SET_IGNORE_MOUSE_EVENTS,
    (_event, ignore: boolean) => {
      overlayWindow?.setIgnoreMouseEvents(ignore, { forward: true })
    }
  )

  ipcMain.handle(IPC_CHANNELS.WINDOW_SHOW_OVERLAY, () => {
    overlayWindow?.showInactive()
  })

  ipcMain.handle(IPC_CHANNELS.WINDOW_HIDE_OVERLAY, () => {
    overlayWindow?.hide()
  })

  // ============================================
  // MEETING MODE
  // ============================================

  // Enter meeting mode: hide main window, show overlay pill
  ipcMain.handle('meeting:enter', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.hide()
    }
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
      overlayWindow.setSize(PILL_WIDTH, PILL_HEIGHT)
      overlayWindow.setPosition(sw - PILL_WIDTH - 24, sh - PILL_HEIGHT - 24)
      overlayWindow.showInactive()
      overlayWindow.webContents.send('overlay:modeChange', 'pill')
    }
  })

  // Exit meeting mode: show main window, hide overlay
  ipcMain.handle('meeting:exit', () => {
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.hide()
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show()
      mainWindow.focus()
    }
  })

  // Resize overlay between pill and panel
  ipcMain.handle('overlay:resize', (_event, mode: 'pill' | 'panel') => {
    if (!overlayWindow || overlayWindow.isDestroyed()) return
    const [x, y] = overlayWindow.getPosition()
    const { height: sh } = screen.getPrimaryDisplay().workAreaSize
    if (mode === 'panel') {
      overlayWindow.setSize(PANEL_WIDTH, PANEL_HEIGHT)
      const newY = Math.min(y, sh - PANEL_HEIGHT - 8)
      overlayWindow.setPosition(x, newY)
    } else {
      overlayWindow.setSize(PILL_WIDTH, PILL_HEIGHT)
    }
  })

  // Overlay click-through
  ipcMain.handle('overlay:clickThrough', (_event, enabled: boolean) => {
    setOverlayClickThrough(overlayWindow, enabled)
  })

  // Overlay opacity
  ipcMain.handle('overlay:opacity', (_event, opacity: number) => {
    setOverlayOpacity(overlayWindow, opacity)
  })

  // ============================================
  // STEALTH CONTROLS
  // ============================================

  // Enter stealth mode
  ipcMain.handle('stealth:enter', () => {
    enterStealthMode(overlayWindow)
    overlayWindow?.showInactive()
    // Notify all windows about stealth status change
    mainWindow?.webContents.send('stealth:statusChanged', true)
    overlayWindow?.webContents.send('stealth:statusChanged', true)
  })

  // Exit stealth mode
  ipcMain.handle('stealth:exit', () => {
    exitStealthMode(overlayWindow)
    mainWindow?.webContents.send('stealth:statusChanged', false)
    overlayWindow?.webContents.send('stealth:statusChanged', false)
  })

  // Emergency hide all windows
  ipcMain.handle('stealth:emergencyHide', () => {
    emergencyHide(mainWindow, overlayWindow)
  })

  // Show all windows
  ipcMain.handle('stealth:showAll', () => {
    showAll(mainWindow, overlayWindow)
  })

  // Toggle click-through mode
  ipcMain.handle('stealth:clickThrough', (_event, enabled: boolean) => {
    setOverlayClickThrough(overlayWindow, enabled)
  })

  // Set overlay opacity
  ipcMain.handle('stealth:opacity', (_event, opacity: number) => {
    setOverlayOpacity(overlayWindow, opacity)
  })

  // Get stealth status
  ipcMain.handle('stealth:getStatus', () => {
    return {
      stealthActive: getStealthMode(),
      contentProtection: overlayWindow?.isContentProtected?.() ?? true,
      opacity: overlayWindow?.getOpacity() ?? 1.0
    }
  })

  // Enable/disable content protection
  ipcMain.handle('stealth:contentProtection', (_event, enabled: boolean) => {
    overlayWindow?.setContentProtection(enabled)
    // Also apply to main window in stealth mode
    if (getStealthMode()) {
      mainWindow?.setContentProtection(enabled)
    }
  })

  // ============================================
  // FILE OPERATIONS
  // ============================================

  ipcMain.handle(IPC_CHANNELS.FILE_OPEN_DIALOG, async (_event, options) => {
    const parent = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined
    const result = await dialog.showOpenDialog(parent, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'txt'] },
        { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      ...options
    })
    return result.filePaths
  })

  ipcMain.handle(IPC_CHANNELS.FILE_SAVE_DIALOG, async (_event, options) => {
    const parent = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined
    const result = await dialog.showSaveDialog(parent, {
      filters: [
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Text', extensions: ['txt'] },
        { name: 'JSON', extensions: ['json'] }
      ],
      ...options
    })
    return result.filePath
  })

  ipcMain.handle(IPC_CHANNELS.FILE_READ, async (_event, filePath: string) => {
    const fs = require('fs/promises')
    return await fs.readFile(filePath)
  })

  ipcMain.handle(
    IPC_CHANNELS.FILE_WRITE,
    async (_event, filePath: string, data: Buffer) => {
      const fs = require('fs/promises')
      await fs.writeFile(filePath, data)
    }
  )

  ipcMain.handle(IPC_CHANNELS.FILE_GET_DOCUMENTS_PATH, () => {
    return app.getPath('documents')
  })

  // ============================================
  // SETTINGS
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async (_event, key: string) => {
    const settingsPath = join(app.getPath('userData'), 'settings.json')
    try {
      const fs = require('fs/promises')
      const data = await fs.readFile(settingsPath, 'utf-8')
      const settings = JSON.parse(data)
      return settings[key]
    } catch {
      return null
    }
  })

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, key: string, value: any) => {
    const settingsPath = join(app.getPath('userData'), 'settings.json')
    const fs = require('fs/promises')
    let settings: Record<string, any> = {}

    try {
      const data = await fs.readFile(settingsPath, 'utf-8')
      settings = JSON.parse(data)
    } catch {
      settings = {}
    }

    settings[key] = value
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
  })

  // ============================================
  // BACKEND MANAGEMENT
  // ============================================

  ipcMain.handle(IPC_CHANNELS.BACKEND_GET_STATUS, () => {
    return { running: true }
  })

  ipcMain.handle(IPC_CHANNELS.BACKEND_START, async () => {
    try {
      await startBackend()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle(IPC_CHANNELS.BACKEND_STOP, () => {
    // stopBackend requires the child process reference; this is a simplified version
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.BACKEND_HEALTH_CHECK, async () => {
    const http = require('http')
    return new Promise<boolean>((resolve) => {
      const req = http.get('http://127.0.0.1:8000/api/v1/health', (res: any) => {
        resolve(res.statusCode === 200)
      })
      req.on('error', () => resolve(false))
      req.setTimeout(2000, () => { req.destroy(); resolve(false) })
    })
  })

  // ============================================
  // SHORTCUTS
  // ============================================

  ipcMain.handle(IPC_CHANNELS.SHORTCUTS_REGISTER, (_event, accelerator: string) => {
    // Global shortcuts are registered at app level; this is a passthrough for renderer requests
    return { success: true }
  })

  ipcMain.handle(IPC_CHANNELS.SHORTCUTS_UNREGISTER, (_event, accelerator: string) => {
    return { success: true }
  })
}
