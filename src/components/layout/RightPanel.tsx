import { useState } from 'react'
import { StickyNote, Trash2, Plus, Sparkles } from 'lucide-react'
import { useTranscriptStore } from '../../stores/transcript-store'

interface Note {
  id: string
  text: string
  createdAt: Date
}

export function RightPanel() {
  const { aiAnswer, segments } = useTranscriptStore()
  const [notes, setNotes] = useState<Note[]>([])
  const [input, setInput] = useState('')

  const addNote = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setNotes((prev) => [
      { id: crypto.randomUUID(), text: trimmed, createdAt: new Date() },
      ...prev,
    ])
    setInput('')
  }

  const deleteNote = (id: string) => setNotes((prev) => prev.filter((n) => n.id !== id))

  const saveAiAnswer = () => {
    if (!aiAnswer.trim()) return
    setNotes((prev) => [
      { id: crypto.randomUUID(), text: `💡 ${aiAnswer.trim()}`, createdAt: new Date() },
      ...prev,
    ])
  }

  return (
    <div className="flex flex-col h-full gap-3">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white/90">Quick Notes</span>
        </div>
        {aiAnswer && (
          <button
            onClick={saveAiAnswer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[11px] font-medium text-primary">Save AI answer</span>
          </button>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-1">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addNote() }}
          placeholder="Add a note..."
          className="flex-1 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/40 transition-colors"
        />
        <button
          onClick={addNote}
          className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center hover:bg-primary/30 transition-colors"
        >
          <Plus className="w-4 h-4 text-primary" />
        </button>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {notes.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-xs text-white/25 leading-relaxed">
              Notes you add will appear here.<br />You can also save AI answers directly.
            </p>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className="group flex items-start gap-3 px-4 py-3 rounded-2xl bg-black/20 border border-white/[0.06] hover:border-white/10 transition-all"
          >
            <p className="flex-1 text-sm text-white/75 leading-relaxed whitespace-pre-wrap">{note.text}</p>
            <button
              onClick={() => deleteNote(note.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-red-400 transition-colors" />
            </button>
          </div>
        ))}
      </div>

      {/* Session stats footer */}
      {segments.length > 0 && (
        <div className="px-4 py-2.5 rounded-2xl border border-white/[0.06] bg-black/20 flex items-center justify-between">
          <span className="text-[11px] text-white/30">Session</span>
          <span className="text-[11px] font-medium text-white/50">
            {segments.length} segment{segments.length !== 1 ? 's' : ''} captured
          </span>
        </div>
      )}

    </div>
  )
}
