import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

export default function ResumePage() {
  const [resume, setResume] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      // TODO: Call API to upload resume
      const formData = new FormData()
      formData.append('file', file)

      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Mock resume data
      setResume({
        id: crypto.randomUUID(),
        title: file.name,
        fileType: file.type.includes('pdf') ? 'pdf' : 'docx',
        fileSize: file.size,
        skills: [
          { name: 'TypeScript', category: 'technical', proficiency: 'advanced' },
          { name: 'React', category: 'technical', proficiency: 'advanced' },
          { name: 'Node.js', category: 'technical', proficiency: 'advanced' },
          { name: 'Python', category: 'technical', proficiency: 'intermediate' },
          { name: 'AWS', category: 'tool', proficiency: 'intermediate' },
          { name: 'Docker', category: 'tool', proficiency: 'intermediate' },
          { name: 'SQL', category: 'technical', proficiency: 'advanced' },
          { name: 'Git', category: 'tool', proficiency: 'expert' },
          { name: 'Problem Solving', category: 'soft', proficiency: 'advanced' },
          { name: 'Team Leadership', category: 'soft', proficiency: 'intermediate' }
        ],
        experience: [
          {
            company: 'Tech Corp',
            title: 'Senior Software Engineer',
            duration: '2022 - Present',
            description: 'Led development of microservices architecture...'
          },
          {
            company: 'StartUp Inc',
            title: 'Software Engineer',
            duration: '2020 - 2022',
            description: 'Built and maintained full-stack applications...'
          }
        ],
        projects: [
          {
            name: 'E-commerce Platform',
            technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
            description: 'Built a scalable e-commerce platform...'
          }
        ]
      })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && (file.type === 'application/pdf' || file.name.endsWith('.docx'))) {
        handleUpload(file)
      }
    },
    [handleUpload]
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Resume Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume to extract skills, experience, and get personalized coaching.
          </p>
        </div>

        {/* Upload area */}
        {!resume ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors
              ${isUploading
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium">Processing your resume...</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extracting skills, experience, and building embeddings
                  </p>
                </div>
                <div className="w-64 mx-auto h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Upload your resume
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop or click to upload
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF and DOCX files
                </p>
                <label className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Choose file
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUpload(file)
                    }}
                  />
                </label>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resume header */}
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{resume.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resume.fileType.toUpperCase()} • {(resume.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <button
                onClick={() => setResume(null)}
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Skills */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-medium mb-4">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill: any) => (
                  <span
                    key={skill.name}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      skill.proficiency === 'expert'
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                        : skill.proficiency === 'advanced'
                        ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                        : skill.proficiency === 'intermediate'
                        ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {skill.name}
                    <span className="ml-1.5 text-xs opacity-70">
                      {skill.proficiency}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-medium mb-4">Experience</h3>
              <div className="space-y-4">
                {resume.experience.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-lg bg-muted/50"
                  >
                    <div className="shrink-0 w-2 h-2 mt-2 rounded-full bg-primary" />
                    <div>
                      <h4 className="font-medium">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {exp.duration}
                      </p>
                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-medium mb-4">Projects</h3>
              <div className="grid gap-4">
                {resume.projects.map((project: any, i: number) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <h4 className="font-medium">{project.name}</h4>
                    <p className="text-sm mt-2">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {project.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat about resume */}
            <div className="p-6 bg-card rounded-xl border border-border">
              <h3 className="text-lg font-medium mb-4">
                Ask about your resume
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized insights and coaching based on your resume content.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., What skills should I highlight for a FAANG interview?"
                  className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
