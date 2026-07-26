import { globalShortcut, BrowserWindow, app } from 'electron'
import {
  enterStealthMode,
  exitStealthMode,
  setOverlayClickThrough,
  setOverlayOpacity,
  overlayClickThrough
} from './window'

function isWinAlive(win: BrowserWindow | null): win is BrowserWindow {
  return win !== null && !win.isDestroyed()
}

export function registerGlobalShortcuts(
  getMainWindow: () => BrowserWindow | null,
  getOverlayWindow: () => BrowserWindow | null
): void {
  // ⌘⇧M — Toggle meeting mode (hide main, show overlay pill / show main, hide overlay)
  globalShortcut.register('CommandOrControl+Shift+M', () => {
    const main = getMainWindow()
    const overlay = getOverlayWindow()
    if (isWinAlive(main) && main.isVisible()) {
      // Enter meeting mode
      main.hide()
      if (isWinAlive(overlay)) {
        overlay.showInactive()
        overlay.webContents.send('overlay:modeChange', 'pill')
      }
    } else {
      // Exit meeting mode
      if (isWinAlive(overlay)) overlay.hide()
      if (isWinAlive(main)) {
        main.show()
        main.focus()
      }
    }
  })

  // ⌘⇧Space — Show/hide overlay
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    const overlay = getOverlayWindow()
    if (!isWinAlive(overlay)) return
    setOverlayClickThrough(overlay, !overlayClickThrough)
  })

  globalShortcut.register('CommandOrControl+Shift+-', () => {
    const overlay = getOverlayWindow()
    if (!isWinAlive(overlay)) return
    const currentOpacity = overlay.getOpacity()
    setOverlayOpacity(overlay, Math.max(0.1, currentOpacity - 0.1))
  })

  globalShortcut.register('CommandOrControl+Shift+=', () => {
    const overlay = getOverlayWindow()
    if (!isWinAlive(overlay)) return
    const currentOpacity = overlay.getOpacity()
    setOverlayOpacity(overlay, Math.min(1.0, currentOpacity + 0.1))
  })

  globalShortcut.register('CommandOrControl+Shift+0', () => {
    const overlay = getOverlayWindow()
    if (!isWinAlive(overlay)) return
    setOverlayOpacity(overlay, 1.0)
  })

  globalShortcut.register('CommandOrControl+Shift+T', () => {
    const win = getMainWindow()
    if (!isWinAlive(win)) return
    win.webContents.send('transcription:toggle')
  })

  globalShortcut.register('CommandOrControl+Shift+S', () => {
    const win = getMainWindow()
    if (!isWinAlive(win)) return
    win.webContents.send('screenshot:capture')
  })

  globalShortcut.register('CommandOrControl+Shift+/', () => {
    const overlay = getOverlayWindow()
    if (!isWinAlive(overlay)) return
    if (overlay.isVisible()) {
      overlay.webContents.send('overlay:focus-input')
    } else {
      overlay.showInactive()
      setTimeout(() => {
        const o = getOverlayWindow()
        if (isWinAlive(o)) {
          o.webContents.send('overlay:focus-input')
        }
      }, 300)
    }
  })
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll()
}
