import React from 'react'
import { Mic, Wifi, Server, Cpu, Zap, Activity, Globe } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../stores/app-store'

export function BottomStatusBar() {
  const { isMicEnabled } = useAppStore()

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
      <div className="glass-toolbar px-3 py-2 rounded-2xl flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10">
        
        <StatusPill 
          icon={<Mic className={cn("w-3.5 h-3.5", isMicEnabled ? "text-success" : "text-destructive")} />} 
          label={isMicEnabled ? "Mic On" : "Mic Off"} 
        />
        
        <Divider />
        
        <StatusPill 
          icon={<Wifi className="w-3.5 h-3.5 text-success" />} 
          label="Connected" 
        />
        
        <Divider />
        
        <StatusPill 
          icon={<Zap className="w-3.5 h-3.5 text-accent" />} 
          label="AI Ready" 
        />
        
        <Divider />
        
        <StatusPill 
          icon={<Activity className="w-3.5 h-3.5 text-white/50" />} 
          label="24ms" 
        />
        
        <Divider />
        
        <StatusPill 
          icon={<Server className="w-3.5 h-3.5 text-primary" />} 
          label="GPT-4o" 
        />
        
        <Divider />
        
        <StatusPill 
          icon={<Cpu className="w-3.5 h-3.5 text-secondary" />} 
          label="4.2k tkns" 
        />

        <Divider />
        
        <StatusPill 
          icon={<Globe className="w-3.5 h-3.5 text-success" />} 
          label="Online" 
        />

      </div>
    </div>
  )
}

function StatusPill({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.03] hover:bg-white/[0.08] transition-colors rounded-lg border border-white/5 cursor-default">
      {icon}
      <span className="text-[11px] font-medium text-white/70 tracking-wide">{label}</span>
    </div>
  )
}

function Divider() {
  return <div className="w-px h-4 bg-white/10 mx-0.5" />
}
