import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Window management
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    setAlwaysOnTop: (flag: boolean, level?: string) =>
      ipcRenderer.invoke('window:setAlwaysOnTop', flag, level),
    setContentProtection: (enabled: boolean) =>
      ipcRenderer.invoke('window:setContentProtection', enabled),
    setIgnoreMouseEvents: (ignore: boolean) =>
      ipcRenderer.invoke('window:setIgnoreMouseEvents', ignore),
    showOverlay: () => ipcRenderer.invoke('window:showOverlay'),
    hideOverlay: () => ipcRenderer.invoke('window:hideOverlay'),
  },

  // Overlay controls
  overlay: {
    resize: (mode: 'pill' | 'panel') => ipcRenderer.invoke('overlay:resize', mode),
    setClickThrough: (enabled: boolean) => ipcRenderer.invoke('overlay:clickThrough', enabled),
    setOpacity: (opacity: number) => ipcRenderer.invoke('overlay:opacity', opacity),
    onModeChange: (callback: (mode: string) => void) => {
      ipcRenderer.on('overlay:modeChange', (_event, mode) => callback(mode))
    },
  },

  // Meeting controls
  meeting: {
    start: () => ipcRenderer.invoke('meeting:enter'),
    exit: () => ipcRenderer.invoke('meeting:exit'),
  },

  // Stealth controls
  stealth: {
    setClickThrough: (enabled: boolean) => ipcRenderer.invoke('stealth:clickThrough', enabled),
    setOpacity: (opacity: number) => ipcRenderer.invoke('stealth:opacity', opacity),
    getStatus: () => ipcRenderer.invoke('stealth:getStatus'),
  },

  // File operations
  file: {
    openDialog: (options: any) => ipcRenderer.invoke('file:openDialog', options),
    saveDialog: (options: any) => ipcRenderer.invoke('file:saveDialog', options),
    readFile: (path: string) => ipcRenderer.invoke('file:readFile', path),
    writeFile: (path: string, data: Buffer) =>
      ipcRenderer.invoke('file:writeFile', path, data),
    getDocumentsPath: () => ipcRenderer.invoke('file:getDocumentsPath'),
  },

  // Backend communication
  backend: {
    getStatus: () => ipcRenderer.invoke('backend:getStatus'),
    healthCheck: () => ipcRenderer.invoke('backend:healthCheck'),
  },

  // Settings
  settings: {
    get: (key: string) => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
  },

  // Events from main process
  onBackendStatus: (callback: (status: string) => void) => {
    ipcRenderer.on('backend:status', (_event, status) => callback(status))
  },
  onTranscriptionToggle: (callback: () => void) => {
    ipcRenderer.on('transcription:toggle', () => callback())
  },
})

export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    setAlwaysOnTop: (flag: boolean, level?: string) => Promise<void>
    setContentProtection: (enabled: boolean) => Promise<void>
    setIgnoreMouseEvents: (ignore: boolean) => Promise<void>
    showOverlay: () => Promise<void>
    hideOverlay: () => Promise<void>
  }
  overlay: {
    resize: (mode: 'pill' | 'panel') => Promise<void>
    setClickThrough: (enabled: boolean) => Promise<void>
    setOpacity: (opacity: number) => Promise<void>
    onModeChange: (callback: (mode: string) => void) => void
  }
  meeting: {
    start: () => Promise<void>
    exit: () => Promise<void>
  }
  stealth: {
    setClickThrough: (enabled: boolean) => Promise<void>
    setOpacity: (opacity: number) => Promise<void>
    getStatus: Promise<{ stealthActive: boolean; contentProtection: boolean; opacity: number }>
  }
  file: {
    openDialog: (options: any) => Promise<string[]>
    saveDialog: (options: any) => Promise<string>
    readFile: (path: string) => Promise<Buffer>
    writeFile: (path: string, data: Buffer) => Promise<void>
    getDocumentsPath: () => Promise<string>
  }
  backend: {
    getStatus: () => Promise<string>
    healthCheck: () => Promise<boolean>
  }
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  onBackendStatus: (callback: (status: string) => void) => void
  onTranscriptionToggle: (callback: () => void) => void
}
