import { useTheme } from '../../../hooks/useTheme'
import { useAppStore } from '../../../stores/app-store'
import {
  Palette,
  Keyboard,
  Shield,
  Cpu,
  Mic,
  Info,
  Moon,
  Sun,
  Monitor,
  ChevronRight
} from 'lucide-react'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { backendStatus, ollamaStatus } = useAppStore()

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your Avelyn preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <SettingsSection
            icon={<Palette className="w-5 h-5" />}
            title="Appearance"
            description="Customize the look and feel"
          >
            <div>
              <label className="text-sm font-medium mb-3 block">Theme</label>
              <div className="flex gap-3">
                <ThemeButton
                  active={theme === 'dark'}
                  onClick={() => setTheme('dark')}
                  icon={<Moon className="w-5 h-5" />}
                  label="Dark"
                />
                <ThemeButton
                  active={theme === 'light'}
                  onClick={() => setTheme('light')}
                  icon={<Sun className="w-5 h-5" />}
                  label="Light"
                />
                <ThemeButton
                  active={theme === 'system'}
                  onClick={() => setTheme('system')}
                  icon={<Monitor className="w-5 h-5" />}
                  label="System"
                />
              </div>
            </div>
          </SettingsSection>

          {/* AI Settings */}
          <SettingsSection
            icon={<Cpu className="w-5 h-5" />}
            title="AI Configuration"
            description="Configure AI models and API keys"
          >
            <div className="space-y-4">
              {/* OpenAI API Key */}
              <div>
                <label className="text-sm font-medium mb-2 block">OpenAI API Key</label>
                <input
                  type="password"
                  placeholder="sk-..."
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is encrypted and stored locally.
                </p>
              </div>

              {/* Ollama Status */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'available' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium">Ollama (Local LLM)</p>
                    <p className="text-xs text-muted-foreground">
                      {ollamaStatus === 'available' ? 'Connected' : 'Not available'}
                    </p>
                  </div>
                </div>
                <button className="text-sm text-primary hover:underline">
                  Configure
                </button>
              </div>

              {/* Default Model */}
              <div>
                <label className="text-sm font-medium mb-2 block">Default Model</label>
                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="auto">Auto-select (Recommended)</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="llama3.1:8b">Llama 3.1 (8B) - Local</option>
                  <option value="llama3.1:70b">Llama 3.1 (70B) - Local</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          {/* Audio Settings */}
          <SettingsSection
            icon={<Mic className="w-5 h-5" />}
            title="Audio"
            description="Configure microphone and transcription"
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Microphone</label>
                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Default Microphone</option>
                  <option>Built-in Microphone</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Transcription Model</label>
                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="base.en">Base (English) - Fast</option>
                  <option value="small.en">Small (English) - Balanced</option>
                  <option value="medium.en">Medium (English) - Accurate</option>
                  <option value="large-v3">Large v3 - Best quality</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          {/* Keyboard Shortcuts */}
          <SettingsSection
            icon={<Keyboard className="w-5 h-5" />}
            title="Keyboard Shortcuts"
            description="Customize keyboard shortcuts"
          >
            <div className="space-y-3">
              <ShortcutRow action="Toggle Overlay" shortcut="⌘⇧Space" />
              <ShortcutRow action="Toggle Transcription" shortcut="⌘⇧T" />
              <ShortcutRow action="Screenshot + OCR" shortcut="⌘⇧S" />
              <ShortcutRow action="Mock Interview" shortcut="⌘⇧M" />
              <ShortcutRow action="New Conversation" shortcut="⌘⇧N" />
              <ShortcutRow action="Command Palette" shortcut="⌘K" />
            </div>
          </SettingsSection>

          {/* Security */}
          <SettingsSection
            icon={<Shield className="w-5 h-5" />}
            title="Security & Privacy"
            description="Data protection and privacy settings"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Local Processing Only</p>
                  <p className="text-xs text-muted-foreground">
                    Never send data to cloud APIs
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Content Protection</p>
                  <p className="text-xs text-muted-foreground">
                    Hide overlay from screen capture
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary
                    after:content-[''] after:absolute after:top-[2px] after:start-[2px]
                    after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                    peer-checked:after:translate-x-full" />
                </label>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Data Retention</label>
                <select className="w-full px-4 py-2 bg-muted border border-border rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90" selected>90 days</option>
                  <option value="365">1 year</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
            </div>
          </SettingsSection>

          {/* About */}
          <SettingsSection
            icon={<Info className="w-5 h-5" />}
            title="About"
            description="Version and credits"
          >
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Version 1.0.0</p>
              <p className="text-muted-foreground">
                Built with Electron, React, FastAPI, and Ollama
              </p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}

function SettingsSection({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="p-6 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-primary">{icon}</div>
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function ThemeButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border hover:bg-muted text-muted-foreground'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function ShortcutRow({ action, shortcut }: { action: string; shortcut: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{action}</span>
      <kbd className="px-2 py-1 text-xs bg-muted rounded font-mono">{shortcut}</kbd>
    </div>
  )
}
