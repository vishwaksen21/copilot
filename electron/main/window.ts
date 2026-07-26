import { BrowserWindow, screen, nativeImage, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

export let stealthMode = false
export let overlayClickThrough = false

export function setStealthMode(enabled: boolean): void {
  stealthMode = enabled
}

export function getStealthMode(): boolean {
  return stealthMode
}

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  const rendererUrl = process.env['ELECTRON_RENDERER_URL']

  if (is.dev && rendererUrl) {
    mainWindow.loadURL(rendererUrl)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[Window] FAILED TO LOAD:', errorCode, errorDescription, validatedURL)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Window] Page loaded:', mainWindow.webContents.getURL())
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    const prefix = ['[RENDERER:LOG]', '[RENDERER:WARN]', '[RENDERER:ERR]', '[RENDERER:INFO]']
    console.log(`${prefix[level] || '[RENDERER]'} ${message} (${sourceId}:${line})`)
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow.isDestroyed()) return
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Only allow safe external URLs
    const url = details.url
    const allowedProtocols = ['https:', 'http:']
    const allowedHosts = ['github.com', 'opencode.ai', 'avelyn.app']
    try {
      const parsed = new URL(url)
      if (allowedProtocols.includes(parsed.protocol) && allowedHosts.some(h => parsed.hostname.endsWith(h))) {
        require('electron').shell.openExternal(url)
      } else {
        console.warn('[Window] Blocked openExternal:', url)
      }
    } catch {
      console.warn('[Window] Invalid URL for openExternal:', url)
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentURL = mainWindow.webContents.getURL()
    if (!currentURL && (url.startsWith('http://localhost') || url.startsWith('file://'))) {
      return
    }
    if (currentURL && url !== currentURL) {
      event.preventDefault()
    }
  })

  return mainWindow
}

export function createOverlayWindow(parent: BrowserWindow): BrowserWindow {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

  const PILL_WIDTH = 320
  const PILL_HEIGHT = 56

  const overlayWindow = new BrowserWindow({
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    x: screenWidth - PILL_WIDTH - 24,
    y: screenHeight - PILL_HEIGHT - 24,
    show: false,
    frame: false,
    transparent: true,
    hasShadow: true,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: false,
    movable: true,
    focusable: true,
    paintWhenInitiallyHidden: true,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  overlayWindow.setContentProtection(true)

  if (process.platform === 'darwin') {
    overlayWindow.setHiddenInMissionControl(true)
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  }

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/overlay`)
  } else {
    overlayWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash: '/overlay'
    })
  }

  overlayWindow.on('ready-to-show', () => {
    if (overlayWindow.isDestroyed()) return
    overlayWindow.hide()
  })

  // On Windows, transparent frameless windows can disappear when they lose focus.
  // Re-assert alwaysOnTop when the overlay loses focus so it stays visible.
  overlayWindow.on('blur', () => {
    if (overlayWindow.isDestroyed()) return
    if (process.platform === 'win32') {
      overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    }
  })

  return overlayWindow
}

/**
 * Enter full stealth mode — app becomes invisible to:
 * - Dock (macOS) / Taskbar (Windows)
 * - Cmd+Tab / Alt+Tab task switcher
 * - Mission Control / Task View
 * - Screen recording / screen share (content protection)
 *
 * IMPORTANT: Show overlay FIRST, then hide main window.
 * On Windows, hiding all windows triggers app quit.
 */
export function enterStealthMode(
  mainWindow: BrowserWindow | null,
  overlayWindow: BrowserWindow | null
): void {
  stealthMode = true

  // Step 1: Show overlay FIRST (before hiding anything)
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.setContentProtection(true)
    overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
    overlayWindow.setSkipTaskbar(true)

    if (process.platform === 'darwin') {
      overlayWindow.setHiddenInMissionControl(true)
      overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    }

    overlayWindow.showInactive()
  }

  // Step 2: NOW hide main window
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
    mainWindow.setSkipTaskbar(true)
  }

  // Step 3: Hide from dock (macOS)
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
}

/**
 * Exit stealth mode — restore normal visibility
 */
export function exitStealthMode(
  mainWindow: BrowserWindow | null,
  overlayWindow: BrowserWindow | null
): void {
  stealthMode = false

  // Hide overlay
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide()
  }

  // Restore dock (macOS)
  if (process.platform === 'darwin') {
    app.dock.show()
  }

  // Restore main window
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSkipTaskbar(false)
    mainWindow.show()
    mainWindow.focus()
  }
}

export function setOverlayClickThrough(window: BrowserWindow | null, enabled: boolean): void {
  overlayClickThrough = enabled
  if (window && !window.isDestroyed()) {
    window.setIgnoreMouseEvents(enabled, { forward: true })
  }
}

/**
 * Emergency hide — instant disappear from everywhere
 */
export function emergencyHide(mainWindow: BrowserWindow | null, overlayWindow: BrowserWindow | null): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide()
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide()
  }
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
}

/**
 * Show all windows back
 */
export function showAll(mainWindow: BrowserWindow | null, overlayWindow: BrowserWindow | null): void {
  if (process.platform === 'darwin') {
    app.dock.show()
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSkipTaskbar(false)
    mainWindow.show()
  }
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.showInactive()
  }
}

export function setOverlayOpacity(window: BrowserWindow | null, opacity: number): void {
  if (window && !window.isDestroyed()) {
    window.setOpacity(Math.max(0.1, Math.min(1.0, opacity)))
  }
}
