import { Tray, Menu, nativeImage, BrowserWindow, app, nativeTheme } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

function isWinAlive(win: BrowserWindow | null): win is BrowserWindow {
  return win !== null && !win.isDestroyed()
}

export function setupTray(
  getMainWindow: () => BrowserWindow | null,
  getOverlayWindow: () => BrowserWindow | null
): Tray {
  let icon: any
  try {
    const iconPath = is.dev
      ? join(__dirname, '../../resources/tray-icon.png')
      : join(process.resourcesPath, 'resources/tray-icon.png')
    icon = nativeImage.createFromPath(iconPath)
  } catch {
    icon = nativeImage.createEmpty()
  }
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }

  const tray = new Tray(icon)
  tray.setToolTip('Avelyn')

  function buildContextMenu(): Menu {
    return Menu.buildFromTemplate([
      {
        label: 'Show Main Window',
        click: () => {
          const win = getMainWindow()
          if (isWinAlive(win)) {
            win.show()
            win.focus()
          }
        }
      },
      {
        label: 'Toggle Overlay',
        click: () => {
          const overlay = getOverlayWindow()
          if (isWinAlive(overlay)) {
            if (overlay.isVisible()) {
              overlay.hide()
            } else {
              overlay.showInactive()
            }
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Start Transcription',
        click: () => {
          const win = getMainWindow()
          if (isWinAlive(win)) {
            win.webContents.send('transcription:toggle')
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit()
        }
      }
    ])
  }

  tray.setContextMenu(buildContextMenu())

  tray.on('click', () => {
    if (process.platform === 'darwin') {
      const win = getMainWindow()
      if (isWinAlive(win)) {
        if (win.isVisible()) {
          win.hide()
        } else {
          win.show()
          win.focus()
        }
      }
    }
  })

  return tray
}
