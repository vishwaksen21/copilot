import React from 'react'
import { motion } from 'framer-motion'
import {
  Cloud, Mic, MicOff, History, Settings, HelpCircle,
  X, Video
} from 'lucide-react'
import { useTranscriptStore } from '../../stores/transcript-store'
import { useTranscription } from '../../hooks/useTranscription'
import LiveBadge from '../ui/glass/LiveBadge'
import AudioVisualizer from '../ui/glass/AudioVisualizer'
import { Button } from '../ui/Button'

export function Toolbar() {
  const { isRecording, audioLevel } = useTranscriptStore()
  const { startRecording, stopRecording } = useTranscription()

  const handleClose = () => window.electronAPI?.window?.close?.()
  const handleHide = () => window.electronAPI?.window?.minimize?.()
  const handleStartMeeting = () => window.electronAPI?.meeting?.start?.()

  const toggleRecording = () => {
    if (isRecording) stopRecording()
    else startRecording()
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 drag-region"
    >
      <div className="bg-[#121214]/90 backdrop-blur-xl h-[48px] rounded-full px-2 flex items-center shadow-2xl border border-white/10">

        {/* Logo & Title */}
        <div className="flex items-center gap-2 px-3 no-drag">
          <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
             <span className="text-white text-[10px] font-bold">d</span>
          </div>
          <span className="font-semibold text-sm tracking-tight text-white/90">Avelyn</span>
          <Button variant="ghost" size="icon" className="w-6 h-6 rounded-full hover:bg-white/10 ml-1">
            <Cloud className="w-3.5 h-3.5 text-white/70" />
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Start Meeting Button */}
        <div className="no-drag">
          <button
            onClick={handleStartMeeting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 hover:bg-primary/30 transition-all duration-200"
          >
            <Video className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Start Meeting</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Live Status */}
        <div className="flex items-center gap-2 px-2 no-drag">
          {isRecording && <LiveBadge />}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Audio Visualizer */}
        <div className="flex items-center gap-3 px-3 no-drag">
          {isRecording && <AudioVisualizer level={audioLevel} barCount={4} />}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Mic Toggle */}
        <div className="flex items-center gap-1 px-2 no-drag">
          <button
            onClick={toggleRecording}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRecording
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'hover:bg-white/10 text-white/70'
            }`}
            title={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10">
            <History className="w-4 h-4 text-white/70" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10">
            <Settings className="w-4 h-4 text-white/70" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-white/10">
            <HelpCircle className="w-4 h-4 text-white/70" />
          </Button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Hide Action */}
        <div className="pl-1 pr-2 flex items-center no-drag">
          <button
            onClick={handleHide}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
          >
            <span className="text-xs font-medium text-white/70">Hide</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="pr-1 no-drag">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-destructive/20 hover:text-destructive"
            onClick={handleClose}
          >
            <X className="w-4 h-4 text-white/70" />
          </Button>
        </div>

      </div>
    </motion.div>
  )
}
