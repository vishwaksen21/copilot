import { useState } from 'react'
import { Play, Clock, Target, TrendingUp, ChevronRight, Award, BookOpen } from 'lucide-react'

export default function InterviewPage() {
  const [activeTab, setActiveTab] = useState<'setup' | 'history'>('setup')
  const [interviewType, setInterviewType] = useState<string | null>(null)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">
            Practice with an AI interviewer and get detailed feedback.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'setup'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Interview
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

        {activeTab === 'setup' ? (
          <div className="space-y-6">
            {/* Interview type selection */}
            <div>
              <h2 className="text-lg font-medium mb-4">Select Interview Type</h2>
              <div className="grid grid-cols-3 gap-4">
                <InterviewTypeCard
                  type="technical"
                  title="Technical"
                  description="Data structures, algorithms, system design"
                  icon={<Target className="w-6 h-6" />}
                  isSelected={interviewType === 'technical'}
                  onSelect={() => setInterviewType('technical')}
                />
                <InterviewTypeCard
                  type="behavioral"
                  title="Behavioral"
                  description="STAR method, leadership, teamwork"
                  icon={<BookOpen className="w-6 h-6" />}
                  isSelected={interviewType === 'behavioral'}
                  onSelect={() => setInterviewType('behavioral')}
                />
                <InterviewTypeCard
                  type="coding"
                  title="Coding"
                  description="Live coding, problem solving"
                  icon={<Award className="w-6 h-6" />}
                  isSelected={interviewType === 'coding'}
                  onSelect={() => setInterviewType('coding')}
                />
              </div>
            </div>

            {/* Configuration */}
            {interviewType && (
              <div className="p-6 bg-card rounded-xl border border-border space-y-4">
                <h2 className="text-lg font-medium">Configuration</h2>

                {/* Difficulty */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="flex gap-2">
                    {['Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <div className="flex gap-2">
                    {['15 min', '30 min', '45 min', '60 min'].map((dur) => (
                      <button
                        key={dur}
                        className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Use resume */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useResume"
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="useResume" className="text-sm">
                    Use uploaded resume for personalized questions
                  </label>
                </div>

                {/* Use job description */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="useJD"
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="useJD" className="text-sm">
                    Use job description for targeted preparation
                  </label>
                </div>

                {/* Start button */}
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium">
                  <Play className="w-5 h-5" />
                  Start Interview
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* History items */}
            {[
              {
                id: '1',
                type: 'Technical',
                date: '2025-01-15',
                score: 85,
                duration: '32 min',
                questions: 8
              },
              {
                id: '2',
                type: 'Behavioral',
                date: '2025-01-14',
                score: 72,
                duration: '28 min',
                questions: 6
              },
              {
                id: '3',
                type: 'Coding',
                date: '2025-01-13',
                score: 91,
                duration: '45 min',
                questions: 4
              }
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.type} Interview</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.date} • {item.duration} • {item.questions} questions
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.score}%</div>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InterviewTypeCard({
  type,
  title,
  description,
  icon,
  isSelected,
  onSelect
}: {
  type: string
  title: string
  description: string
  icon: React.ReactNode
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`p-6 rounded-xl border text-left transition-all duration-200 ${
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className={`mb-3 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )
}
