import { useState } from 'react'
import { Play, Square, Clock, FileText, Search, ChevronRight, Users } from 'lucide-react'

export default function MeetingPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('history')
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">Meeting Copilot</h1>
            <p className="text-muted-foreground mt-1">
              Live transcription, AI notes, and action items.
            </p>
          </div>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4" />
                End Meeting
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Meeting
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Meeting
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            History
          </button>
        </div>

        {activeTab === 'active' ? (
          <div className="grid grid-cols-2 gap-6">
            {/* Live transcript */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
                Live Transcript
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isRecording ? (
                  <>
                    <TranscriptEntry speaker="Speaker 1" text="Let's discuss the Q1 roadmap priorities." time="0:00" />
                    <TranscriptEntry speaker="Speaker 2" text="Sure, I think we should focus on the API refactor first." time="0:05" />
                    <TranscriptEntry speaker="Speaker 1" text="Agreed. Can you share the timeline estimates?" time="0:12" />
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Start a meeting to see live transcription
                  </div>
                )}
              </div>
            </div>

            {/* AI Notes */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                AI Notes
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {isRecording ? (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Q1 roadmap discussion initiated</p>
                    <p>• API refactor identified as priority</p>
                    <p>• Timeline estimates requested</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    AI notes will appear during the meeting
                  </div>
                )}
              </div>
            </div>

            {/* Action Items */}
            <div className="col-span-2 p-6 bg-card rounded-xl border border-border">
              <h2 className="font-medium mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Action Items
              </h2>
              {isRecording ? (
                <div className="space-y-2">
                  <ActionItem text="Share API refactor timeline estimates" assignee="Speaker 2" status="pending" />
                  <ActionItem text="Review Q1 roadmap document" assignee="All" status="pending" />
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Action items will be extracted during the meeting
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Meeting history */}
            {[
              {
                id: '1',
                title: 'Q1 Planning Meeting',
                date: '2025-01-15',
                duration: '45 min',
                participants: 4,
                summary: 'Discussed Q1 priorities, API refactor timeline, and resource allocation.'
              },
              {
                id: '2',
                title: 'Sprint Retrospective',
                date: '2025-01-14',
                duration: '30 min',
                participants: 6,
                summary: 'Reviewed sprint progress, identified bottlenecks, and planned improvements.'
              },
              {
                id: '3',
                title: 'Design Review',
                date: '2025-01-13',
                duration: '25 min',
                participants: 3,
                summary: 'Reviewed new dashboard designs, gathered feedback on UX improvements.'
              }
            ].map((meeting) => (
              <div
                key={meeting.id}
                className="p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{meeting.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {meeting.date} • {meeting.duration} • {meeting.participants} participants
                    </p>
                    <p className="text-sm mt-2">{meeting.summary}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TranscriptEntry({
  speaker,
  text,
  time
}: {
  speaker: string
  text: string
  time: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
        {speaker.split(' ').map((w) => w[0]).join('')}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{speaker}</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{text}</p>
      </div>
    </div>
  )
}

function ActionItem({
  text,
  assignee,
  status
}: {
  text: string
  assignee: string
  status: 'pending' | 'completed'
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <input
        type="checkbox"
        checked={status === 'completed'}
        className="w-4 h-4 rounded border-border"
        readOnly
      />
      <div className="flex-1">
        <p className="text-sm">{text}</p>
      </div>
      <span className="text-xs text-muted-foreground px-2 py-1 bg-background rounded">
        {assignee}
      </span>
    </div>
  )
}
