// IPC Channel names
export const IPC_CHANNELS = {
  // Window
  WINDOW_MINIMIZE: 'window:minimize',
  WINDOW_MAXIMIZE: 'window:maximize',
  WINDOW_CLOSE: 'window:close',
  WINDOW_SET_ALWAYS_ON_TOP: 'window:setAlwaysOnTop',
  WINDOW_SET_CONTENT_PROTECTION: 'window:setContentProtection',
  WINDOW_SET_IGNORE_MOUSE_EVENTS: 'window:setIgnoreMouseEvents',
  WINDOW_SHOW_OVERLAY: 'window:showOverlay',
  WINDOW_HIDE_OVERLAY: 'window:hideOverlay',

  // File
  FILE_OPEN_DIALOG: 'file:openDialog',
  FILE_SAVE_DIALOG: 'file:saveDialog',
  FILE_READ: 'file:readFile',
  FILE_WRITE: 'file:writeFile',
  FILE_GET_DOCUMENTS_PATH: 'file:getDocumentsPath',

  // Backend
  BACKEND_GET_STATUS: 'backend:getStatus',
  BACKEND_START: 'backend:start',
  BACKEND_STOP: 'backend:stop',
  BACKEND_HEALTH_CHECK: 'backend:healthCheck',
  BACKEND_STATUS: 'backend:status',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // Shortcuts
  SHORTCUTS_REGISTER: 'shortcuts:register',
  SHORTCUTS_UNREGISTER: 'shortcuts:unregister',

  // Events
  OVERLAY_TOGGLE: 'overlay:toggle',
  TRANSCRIPTION_TOGGLE: 'transcription:toggle',
  SCREENSHOT_CAPTURE: 'screenshot:capture'
} as const
