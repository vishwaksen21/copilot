import { useState } from 'react'
import Editor from '@monaco-editor/react'
import { Play, Lightbulb, BarChart3, Zap, Copy, Check } from 'lucide-react'

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' }
]

export default function CodingPage() {
  const [code, setCode] = useState(`// Write your code here
function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement)!, i];
        }
        map.set(nums[i], i);
    }
    
    return [];
}`)
  const [language, setLanguage] = useState('typescript')
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // TODO: Call API to analyze code
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setAnalysis({
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n)',
      explanation:
        'This solution uses a hash map to find the complement of each element. For each element, we check if the complement (target - current) exists in the map. If it does, we return both indices. Otherwise, we store the current element and its index in the map.',
      optimizations: [
        'The solution is already optimal for this problem',
        'Consider adding input validation for edge cases',
        'Could add early termination if array is empty'
      ],
      topics: ['Hash Map', 'Array', 'Two Pointers']
    })
    setIsAnalyzing(false)
  }

  return (
    <div className="flex h-full">
      {/* Editor panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 bg-muted border border-border rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg
                hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'SF Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true
            }}
          />
        </div>
      </div>

      {/* Analysis panel */}
      <div className="w-96 border-l border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="font-medium">Code Analysis</h2>
        </div>

        {analysis ? (
          <div className="p-4 space-y-6">
            {/* Complexity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Time</div>
                <div className="text-xl font-bold text-primary">
                  {analysis.timeComplexity}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="text-sm text-muted-foreground mb-1">Space</div>
                <div className="text-xl font-bold text-primary">
                  {analysis.spaceComplexity}
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Explanation
              </h3>
              <p className="text-sm text-muted-foreground">{analysis.explanation}</p>
            </div>

            {/* Optimizations */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-500" />
                Optimizations
              </h3>
              <ul className="space-y-2">
                {analysis.optimizations.map((opt: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="text-green-500 mt-1">•</span>
                    {opt}
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics */}
            <div>
              <h3 className="text-sm font-medium mb-2">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.topics.map((topic: string) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">
              Write code and click "Analyze" to get insights on complexity,
              optimizations, and explanations.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function Code({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  )
}
