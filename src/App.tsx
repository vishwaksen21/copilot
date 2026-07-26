import { HashRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { useBackend } from './hooks/useBackend'
import { Toaster } from './components/ui/toaster'
import OverlayWindow from './features/overlay/components/OverlayWindow'

// New Layout Components
import { MainLayout } from './components/layout/MainLayout'
import { LeftPanel } from './components/layout/LeftPanel'
import { RightPanel } from './components/layout/RightPanel'

function CopilotDashboard() {
  useBackend()

  return (
    <MainLayout>
      <div className="flex w-full h-full gap-6">
        <div className="w-[45%] h-full">
          <LeftPanel />
        </div>
        <div className="w-[55%] h-full">
          <RightPanel />
        </div>
      </div>
    </MainLayout>
  )
}

export default function App() {
  const isOverlay = window.location.hash === '#/overlay'

  if (isOverlay) {
    return (
      <ThemeProvider>
        <OverlayWindow />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<CopilotDashboard />} />
          <Route path="/*" element={<CopilotDashboard />} />
        </Routes>
        <Toaster />
      </HashRouter>
    </ThemeProvider>
  )
}
