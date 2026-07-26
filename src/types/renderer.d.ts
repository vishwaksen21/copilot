/// <reference types="vite/client" />

interface StealthAPI {
  setClickThrough: (enabled: boolean) => Promise<void>
  setOpacity: (opacity: number) => Promise<void>
  getStatus: () => Promise<{ stealthActive: boolean; contentProtection: boolean; opacity: number }>
}

interface ElectronAPI {
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
  meeting: {
    enter: () => Promise<void>
    exit: () => Promise<void>
  }
  overlay: {
    resize: (mode: 'pill' | 'panel') => Promise<void>
    onModeChange: (callback: (mode: 'pill' | 'panel') => void) => void
  }
  stealth: StealthAPI
  file: {
    openDialog: (options: any) => Promise<string[]>
    saveDialog: (options: any) => Promise<string>
    readFile: (path: string) => Promise<Buffer>
    writeFile: (path: string, data: Buffer) => Promise<void>
    getDocumentsPath: () => Promise<string>
  }
  backend: {
    getStatus: () => Promise<string>
    start: () => Promise<void>
    stop: () => Promise<void>
    healthCheck: () => Promise<boolean>
  }
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  shortcuts: {
    register: (accelerator: string, callback: () => void) => Promise<void>
    unregister: (accelerator: string) => Promise<void>
  }
  onBackendStatus: (callback: (status: string) => void) => void
  onOverlayToggle: (callback: () => void) => void
  onOverlayFocusInput: (callback: () => void) => void
  onTranscriptionToggle: (callback: () => void) => void
  onScreenshotCapture: (callback: (imagePath: string) => void) => void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
