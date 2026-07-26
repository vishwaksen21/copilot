# Interview Copilot — Complete Architecture Document

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Frontend Architecture](#6-frontend-architecture)
7. [AI/ML Integration Layer](#7-aiml-integration-layer)
8. [Speech Processing Pipeline](#8-speech-processing-pipeline)
9. [Security Architecture](#9-security-architecture)
10. [Development Roadmap](#10-development-roadmap)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Performance Optimisation](#13-performance-optimisation)

---

## 1. Executive Summary

**Interview Copilot** is a production-grade Electron desktop application designed for ethical interview preparation, mock interviews, and meeting assistance. The app runs locally with optional cloud AI integration, featuring a stealth overlay mode for discreet use during practice sessions.

### Core Capabilities

| Feature | Description |
|---|---|
| AI Chat Assistant | GPT-4o / local Ollama LLM with streaming responses |
| Live Transcription | Faster-Whisper + Silero VAD for real-time speech-to-text |
| Resume Intelligence | PDF/DOCX parsing + ChromaDB embeddings for personalised coaching |
| Job Description Analysis | Skill extraction, gap analysis, probable question generation |
| OCR & Vision | Screenshot capture + EasyOCR + multimodal LLM explanation |
| Mock Interview | AI interviewer with STAR coaching, timed responses, follow-ups |
| Coding Assistant | DSA explanation, complexity analysis, multi-language support |
| Meeting Copilot | Live notes, action items, summaries, searchable history |
| Stealth Overlay | Always-on-top transparent window, invisible to screen capture |

---

## 2. Technology Stack

### Frontend (Electron Renderer)

```
Electron 35+              — Desktop shell
React 19                  — UI framework
TypeScript 5.6+           — Type safety
Tailwind CSS v4           — Styling via @tailwindcss/vite
shadcn/ui                 — Component library
Zustand                   — State management
Framer Motion             — Animations
Lucide React              — Icons
Monaco Editor             — Code editor for coding assistant
Highlight.js              — Syntax highlighting
```

### Backend (Python Sidecar)

```
FastAPI                   — REST API + WebSocket server
Uvicorn                   — ASGI server
Pydantic                  — Data validation
JWT (python-jose)         — Authentication
Cryptography              — Local encryption
SQLAlchemy 2.0            — ORM for PostgreSQL
Alembic                   — Database migrations
```

### AI/ML Stack

```
Ollama                    — Local LLM serving
OpenAI Python SDK         — GPT-4o / GPT-4o-mini
Faster-Whisper            — Speech-to-text (CTranslate2)
Silero VAD                — Voice activity detection
sentence-transformers     — Embedding generation
ChromaDB                  — Vector database
EasyOCR                   — Optical character recognition
PyMuPDF                   — PDF extraction
python-docx               — DOCX extraction
```

### Infrastructure

```
PostgreSQL 16             — Primary database
Redis 7                   — Caching, session store, job queue
PyInstaller               — Python backend bundling
electron-builder          — Electron packaging
electron-vite             — Build toolchain
```

### Communication

```
IPC (contextBridge)       — Electron main ↔ renderer
HTTP REST                 — Renderer ↔ Python backend
WebSocket                 — Real-time streaming (transcription, AI)
SSE                       — Server-Sent Events for AI token streaming
```

---

## 3. Project Structure

```
interview-copilot/
├── electron/
│   ├── main/
│   │   ├── index.ts                    # Main process entry
│   │   ├── ipc.ts                      # IPC handler registration
│   │   ├── window.ts                   # Window creation & management
│   │   ├── tray.ts                     # System tray management
│   │   ├── backend.ts                  # Python sidecar lifecycle
│   │   ├── updater.ts                  # Auto-update logic
│   │   ├── security.ts                 # CSP, navigation guards
│   │   ├── shortcuts.ts                # Global keyboard shortcuts
│   │   └── deep-link.ts                # Protocol handler
│   ├── preload/
│   │   ├── index.ts                    # contextBridge API
│   │   └── types.ts                    # Exposed API types
│   └── shared/
│       ├── ipc-channels.ts             # Channel name constants
│       ├── ipc-types.ts                # Request/response type definitions
│       └── constants.ts                # Shared constants
│
├── src/
│   ├── main.tsx                         # React bootstrap
│   ├── App.tsx                          # Root component + router
│   ├── index.html                       # HTML entry
│   │
│   ├── assets/
│   │   ├── fonts/                       # Custom fonts
│   │   ├── icons/                       # App icons
│   │   └── main.css                     # Global styles + Tailwind
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── toaster.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Main layout wrapper
│   │   │   ├── Sidebar.tsx              # Navigation sidebar
│   │   │   ├── Header.tsx               # Top bar with actions
│   │   │   ├── CommandPalette.tsx       # Cmd+K command palette
│   │   │   └── OverlayPanel.tsx         # Stealth overlay UI
│   │   │
│   │   └── shared/
│   │       ├── MarkdownRenderer.tsx     # Render AI markdown responses
│   │       ├── CodeBlock.tsx            # Syntax-highlighted code blocks
│   │       ├── StreamingText.tsx        # Typewriter streaming effect
│   │       ├── FileUpload.tsx           # Drag-and-drop file upload
│   │       ├── Badge.tsx                # Skill/technology badges
│   │       ├── EmptyState.tsx           # Empty state illustrations
│   │       └── LoadingSkeleton.tsx      # Loading placeholders
│   │
│   ├── features/
│   │   ├── chat/
│   │   │   ├── components/
│   │   │   │   ├── ChatPanel.tsx        # Main chat interface
│   │   │   │   ├── MessageBubble.tsx    # Individual message
│   │   │   │   ├── MessageInput.tsx     # Input with file attach
│   │   │   │   ├── ModelSelector.tsx    # GPT/Ollama model picker
│   │   │   │   ├── ConversationList.tsx # Chat history sidebar
│   │   │   │   └── TokenCounter.tsx     # Token usage display
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts           # Chat logic + streaming
│   │   │   │   ├── useModel.ts         # Model selection logic
│   │   │   │   └── useConversation.ts  # Conversation management
│   │   │   └── utils/
│   │   │       └── prompt-builder.ts    # System prompt construction
│   │   │
│   │   ├── transcript/
│   │   │   ├── components/
│   │   │   │   ├── TranscriptPanel.tsx  # Live transcript display
│   │   │   │   ├── TranscriptEntry.tsx  # Single transcript line
│   │   │   │   ├── SpeakerLabel.tsx     # Speaker identification UI
│   │   │   │   ├── AudioLevelMeter.tsx  # Microphone level indicator
│   │   │   │   └── TranscriptSearch.tsx # Search across transcripts
│   │   │   ├── hooks/
│   │   │   │   ├── useTranscription.ts  # WebSocket transcription
│   │   │   │   ├── useAudioDevice.ts   # Microphone selection
│   │   │   │   └── useSpeakerDiarization.ts
│   │   │   └── utils/
│   │   │       └── transcript-formatter.ts
│   │   │
│   │   ├── resume/
│   │   │   ├── components/
│   │   │   │   ├── ResumeUpload.tsx     # PDF/DOCX upload zone
│   │   │   │   ├── ResumeInsights.tsx   # Extracted skills/projects
│   │   │   │   ├── SkillMatrix.tsx      # Skills visualization
│   │   │   │   ├── ExperienceTimeline.tsx
│   │   │   │   └── ResumeChat.tsx       # Q&A about resume content
│   │   │   ├── hooks/
│   │   │   │   ├── useResume.ts         # Resume upload + parsing
│   │   │   │   ├── useResumeInsights.ts # Extracted data management
│   │   │   │   └── useResumeEmbeddings.ts
│   │   │   └── utils/
│   │   │       └── resume-parser.ts     # Client-side validation
│   │   │
│   │   ├── job-description/
│   │   │   ├── components/
│   │   │   │   ├── JDUpload.tsx         # JD paste/upload
│   │   │   │   ├── SkillExtraction.tsx  # Extracted requirements
│   │   │   │   ├── GapAnalysis.tsx      # Resume vs JD comparison
│   │   │   │   ├── ProbableQuestions.tsx # AI-generated questions
│   │   │   │   └── SkillGapChart.tsx    # Visual gap analysis
│   │   │   ├── hooks/
│   │   │   │   ├── useJobDescription.ts
│   │   │   │   ├── useGapAnalysis.ts
│   │   │   │   └── useQuestionGenerator.ts
│   │   │   └── utils/
│   │   │       └── jd-analyzer.ts
│   │   │
│   │   ├── mock-interview/
│   │   │   ├── components/
│   │   │   │   ├── InterviewDashboard.tsx # Interview setup screen
│   │   │   │   ├── InterviewSession.tsx  # Active interview UI
│   │   │   │   ├── QuestionCard.tsx      # Interview question display
│   │   │   │   ├── TimerWidget.tsx       # Response timer
│   │   │   │   ├── STARCoach.tsx         # STAR method coaching
│   │   │   │   ├── CodingSandbox.tsx     # In-browser code editor
│   │   │   │   ├── InterviewFeedback.tsx # Post-interview feedback
│   │   │   │   └── InterviewHistory.tsx  # Past interviews
│   │   │   ├── hooks/
│   │   │   │   ├── useInterview.ts       # Interview state machine
│   │   │   │   ├── useTimer.ts           # Countdown timer
│   │   │   │   ├── useSTARCoach.ts       # STAR response analysis
│   │   │   │   └── useInterviewScoring.ts
│   │   │   └── utils/
│   │   │       ├── question-bank.ts      # Question templates
│   │   │       └── scoring-rubric.ts     # Evaluation criteria
│   │   │
│   │   ├── coding-assistant/
│   │   │   ├── components/
│   │   │   │   ├── CodeExplainer.tsx     # DSA problem explanation
│   │   │   │   ├── ComplexityAnalyzer.tsx # Big-O analysis display
│   │   │   │   ├── CodeEditor.tsx        # Monaco editor wrapper
│   │   │   │   ├── LanguageSelector.tsx  # Programming language picker
│   │   │   │   └── OptimizationPanel.tsx # Code optimization suggestions
│   │   │   ├── hooks/
│   │   │   │   ├── useCodeAnalysis.ts
│   │   │   │   └── useCodeExecution.ts
│   │   │   └── utils/
│   │   │       └── complexity-analyzer.ts
│   │   │
│   │   ├── meeting/
│   │   │   ├── components/
│   │   │   │   ├── MeetingDashboard.tsx  # Meeting list + controls
│   │   │   │   ├── MeetingSession.tsx    # Active meeting UI
│   │   │   │   ├── MeetingNotes.tsx      # AI-generated notes
│   │   │   │   ├── ActionItems.tsx       # Extracted action items
│   │   │   │   ├── MeetingSummary.tsx    # Post-meeting summary
│   │   │   │   └── MeetingSearch.tsx     # Cross-meeting search
│   │   │   ├── hooks/
│   │   │   │   ├── useMeeting.ts
│   │   │   │   ├── useMeetingNotes.ts
│   │   │   │   └── useActionItems.ts
│   │   │   └── utils/
│   │   │       └── note-generator.ts
│   │   │
│   │   ├── ocr/
│   │   │   ├── components/
│   │   │   │   ├── ScreenshotCapture.tsx  # Screenshot UI overlay
│   │   │   │   ├── OCRResult.tsx          # Extracted text display
│   │   │   │   ├── ImageExplainer.tsx     # Vision LLM explanation
│   │   │   │   └── AnnotationOverlay.tsx  # Region selection for OCR
│   │   │   ├── hooks/
│   │   │   │   ├── useScreenshot.ts
│   │   │   │   ├── useOCR.ts
│   │   │   │   └── useVisionLLM.ts
│   │   │   └── utils/
│   │   │       └── image-processor.ts
│   │   │
│   │   ├── overlay/
│   │   │   ├── components/
│   │   │   │   ├── OverlayWindow.tsx     # Stealth overlay main
│   │   │   │   ├── CompactChat.tsx       # Mini chat widget
│   │   │   │   ├── QuickAnswer.tsx       # Single-shot answer panel
│   │   │   │   └── TranscriptionHUD.tsx  # Floating transcript
│   │   │   ├── hooks/
│   │   │   │   ├── useOverlay.ts
│   │   │   │   └── useGlobalShortcut.ts
│   │   │   └── utils/
│   │   │       └── window-position.ts
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── SettingsPage.tsx       # Main settings
│   │       │   ├── AISettings.tsx         # API keys, model config
│   │       │   ├── AudioSettings.tsx      # Microphone, speaker
│   │       │   ├── AppearanceSettings.tsx # Theme, font, layout
│   │       │   ├── KeyboardSettings.tsx   # Shortcut config
│   │       │   ├── SecuritySettings.tsx   # Encryption, privacy
│   │       │   └── AboutPage.tsx          # Version, credits
│   │       └── hooks/
│   │           └── useSettings.ts
│   │
│   ├── stores/
│   │   ├── app-store.ts                  # Global app state
│   │   ├── chat-store.ts                 # Chat messages & conversations
│   │   ├── transcript-store.ts           # Transcription state
│   │   ├── resume-store.ts              # Resume data
│   │   ├── interview-store.ts           # Interview session state
│   │   ├── meeting-store.ts             # Meeting state
│   │   ├── settings-store.ts            # User preferences
│   │   └── overlay-store.ts             # Overlay window state
│   │
│   ├── hooks/
│   │   ├── useTheme.ts                   # Dark/light mode
│   │   ├── useKeyboardShortcuts.ts       # Global shortcuts
│   │   ├── useNotification.ts            # Toast notifications
│   │   ├── useBackend.ts                 # Python backend health
│   │   ├── useIPC.ts                     # Typed IPC wrapper
│   │   └── useWebSocket.ts              # WebSocket connection
│   │
│   ├── lib/
│   │   ├── api-client.ts                 # HTTP client for backend
│   │   ├── websocket-client.ts           # WebSocket manager
│   │   ├── crypto.ts                     # Client-side encryption
│   │   ├── file-utils.ts                 # File handling utilities
│   │   └── formatters.ts                 # Date, text formatters
│   │
│   ├── types/
│   │   ├── chat.ts                       # Chat message types
│   │   ├── transcript.ts                 # Transcript types
│   │   ├── resume.ts                     # Resume data types
│   │   ├── interview.ts                  # Interview session types
│   │   ├── meeting.ts                    # Meeting types
│   │   ├── ai.ts                         # AI model types
│   │   └── api.ts                        # API request/response types
│   │
│   └── styles/
│       ├── globals.css                   # Global styles
│       └── themes.css                    # Theme variables
│
├── backend/
│   ├── pyproject.toml                    # Python project config
│   ├── alembic.ini                       # Migration config
│   ├── alembic/                          # Database migrations
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                       # FastAPI app entry
│   │   ├── config.py                     # Settings via pydantic-settings
│   │   ├── dependencies.py               # DI container
│   │   ├── security.py                   # JWT, encryption
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py             # API v1 router
│   │   │   │   ├── chat.py               # /api/v1/chat
│   │   │   │   ├── transcription.py      # /api/v1/transcription
│   │   │   │   ├── resume.py             # /api/v1/resume
│   │   │   │   ├── job_description.py    # /api/v1/job-description
│   │   │   │   ├── ocr.py                # /api/v1/ocr
│   │   │   │   ├── mock_interview.py     # /api/v1/mock-interview
│   │   │   │   ├── coding.py             # /api/v1/coding
│   │   │   │   ├── meeting.py            # /api/v1/meeting
│   │   │   │   ├── auth.py               # /api/v1/auth
│   │   │   │   └── settings.py           # /api/v1/settings
│   │   │   └── websocket/
│   │   │       ├── __init__.py
│   │   │       ├── manager.py            # Connection manager
│   │   │       ├── chat_stream.py        # AI chat streaming WS
│   │   │       ├── transcription.py      # Live transcription WS
│   │   │       └── meeting_stream.py     # Meeting stream WS
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                   # SQLAlchemy base
│   │   │   ├── user.py                   # User model
│   │   │   ├── conversation.py           # Chat conversations
│   │   │   ├── message.py                # Chat messages
│   │   │   ├── resume.py                 # Resume data
│   │   │   ├── job_description.py        # Job descriptions
│   │   │   ├── interview.py              # Interview sessions
│   │   │   ├── meeting.py                # Meeting records
│   │   │   ├── transcript.py             # Transcription segments
│   │   │   ├── code_analysis.py          # Code analysis results
│   │   │   └── settings.py              # User settings
│   │   │
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py                   # Pydantic request/response
│   │   │   ├── transcript.py
│   │   │   ├── resume.py
│   │   │   ├── job_description.py
│   │   │   ├── interview.py
│   │   │   ├── meeting.py
│   │   │   ├── ocr.py
│   │   │   └── auth.py
│   │   │
│   │   ├── repositories/
│   │   │   ├── __init__.py
│   │   │   ├── base.py                   # Generic repository
│   │   │   ├── user_repository.py
│   │   │   ├── conversation_repository.py
│   │   │   ├── resume_repository.py
│   │   │   ├── interview_repository.py
│   │   │   ├── meeting_repository.py
│   │   │   └── transcript_repository.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base.py               # Abstract AI service
│   │   │   │   ├── openai_service.py     # GPT integration
│   │   │   │   ├── ollama_service.py     # Local LLM integration
│   │   │   │   ├── model_router.py       # Auto model selection
│   │   │   │   ├── prompt_builder.py     # System prompt construction
│   │   │   │   ├── conversation_memory.py # Context management
│   │   │   │   └── streaming.py          # SSE/streaming utilities
│   │   │   │
│   │   │   ├── speech/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── transcription_service.py  # Faster-Whisper wrapper
│   │   │   │   ├── vad_service.py            # Silero VAD
│   │   │   │   ├── audio_capture.py          # Microphone capture
│   │   │   │   ├── speaker_diarization.py    # Speaker detection
│   │   │   │   └── audio_processing.py       # Noise reduction, format
│   │   │   │
│   │   │   ├── resume/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── resume_parser.py      # PDF/DOCX extraction
│   │   │   │   ├── skill_extractor.py    # NLP skill extraction
│   │   │   │   ├── embedding_service.py  # Vector embeddings
│   │   │   │   ├── vector_store.py       # ChromaDB operations
│   │   │   │   └── resume_analyzer.py    # Resume scoring/analysis
│   │   │   │
│   │   │   ├── job_description/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── jd_parser.py          # JD text extraction
│   │   │   │   ├── requirement_extractor.py # Required skills/qualifications
│   │   │   │   ├── gap_analyzer.py       # Resume vs JD comparison
│   │   │   │   └── question_generator.py # Probable interview questions
│   │   │   │
│   │   │   ├── ocr/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── ocr_service.py        # EasyOCR wrapper
│   │   │   │   ├── screenshot_service.py # Screen capture
│   │   │   │   └── image_analyzer.py     # Vision LLM integration
│   │   │   │
│   │   │   ├── mock_interview/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── interview_engine.py   # Interview flow controller
│   │   │   │   ├── question_selector.py  # Adaptive question selection
│   │   │   │   ├── star_coach.py         # STAR method evaluator
│   │   │   │   ├── coding_challenge.py   # Coding problem generator
│   │   │   │   ├── timer_service.py      # Response timing
│   │   │   │   └── feedback_generator.py # Post-interview analysis
│   │   │   │
│   │   │   ├── coding/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── code_analyzer.py      # DSA problem analysis
│   │   │   │   ├── complexity_analyzer.py # Big-O computation
│   │   │   │   ├── optimization_suggester.py
│   │   │   │   └── multi_language.py     # Language-specific formatting
│   │   │   │
│   │   │   └── meeting/
│   │   │       ├── __init__.py
│   │   │       ├── meeting_processor.py  # Meeting data processing
│   │   │       ├── note_generator.py     # AI note generation
│   │   │       ├── action_item_extractor.py
│   │   │       └── summary_generator.py  # Meeting summaries
│   │   │
│   │   └── workers/
│   │       ├── __init__.py
│   │       ├── embedding_worker.py       # Background embedding tasks
│   │       ├── transcription_worker.py   # Background transcription
│   │       └── cleanup_worker.py         # Data cleanup/scheduling
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── unit/
│   │   │   ├── test_resume_parser.py
│   │   │   ├── test_skill_extractor.py
│   │   │   ├── test_gap_analyzer.py
│   │   │   └── test_model_router.py
│   │   ├── integration/
│   │   │   ├── test_chat_api.py
│   │   │   ├── test_transcription_api.py
│   │   │   └── test_resume_api.py
│   │   └── e2e/
│   │       └── test_interview_flow.py
│   │
│   └── requirements.txt
│
├── electron.vite.config.ts              # Electron-vite config
├── tsconfig.json                        # TypeScript config
├── tailwind.config.ts                   # Tailwind v3 config (if using v3)
├── components.json                      # shadcn/ui config
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example                         # Environment variables template
├── electron-builder.yml                 # Build configuration
├── vite.config.ts                       # For shadcn CLI compatibility
└── README.md
```

---

## 4. Database Schema

### PostgreSQL Schema

```sql
-- =============================================
-- USERS & AUTHENTICATION
-- =============================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    password_hash   VARCHAR(255),
    is_active       BOOLEAN DEFAULT true,
    preferences     JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_keys (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,  -- 'openai', 'anthropic', 'ollama'
    encrypted_key   TEXT NOT NULL,         -- Encrypted with user's master key
    key_hint        VARCHAR(10),           -- Last 4 chars for display
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ
);

-- =============================================
-- CHAT & CONVERSATIONS
-- =============================================

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    mode            VARCHAR(50) NOT NULL,   -- 'general', 'mock_interview', 'coding', 'meeting'
    model_provider  VARCHAR(50),            -- 'openai', 'ollama'
    model_name      VARCHAR(100),           -- 'gpt-4o', 'llama3.1', etc.
    system_prompt   TEXT,
    metadata        JSONB DEFAULT '{}',
    is_archived     BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,   -- 'user', 'assistant', 'system', 'tool'
    content         TEXT NOT NULL,
    tokens_used     INTEGER,
    model_used      VARCHAR(100),
    metadata        JSONB DEFAULT '{}',     -- e.g., code blocks, citations
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);

-- =============================================
-- RESUMES
-- =============================================

CREATE TABLE resumes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,  -- "Software Engineer Resume v2"
    file_path       TEXT NOT NULL,           -- Encrypted local path
    file_type       VARCHAR(10) NOT NULL,   -- 'pdf', 'docx'
    file_size       INTEGER,
    raw_text        TEXT,                    -- Extracted plain text
    parsed_data     JSONB DEFAULT '{}',      -- Structured extraction
    embedding_id    VARCHAR(255),            -- ChromaDB collection reference
    version         INTEGER DEFAULT 1,
    is_default      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resume_skills (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id       UUID REFERENCES resumes(id) ON DELETE CASCADE,
    skill_name      VARCHAR(100) NOT NULL,
    skill_category  VARCHAR(50),            -- 'technical', 'soft', 'tool', 'language'
    proficiency     VARCHAR(20),            -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_experience DECIMAL(3,1),
    confidence      DECIMAL(3,2),           -- NLP extraction confidence
    source          VARCHAR(50),            -- 'extracted', 'user_confirmed'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resume_projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id       UUID REFERENCES resumes(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    technologies    TEXT[],                  -- Array of tech used
    role            VARCHAR(100),
    duration        VARCHAR(50),
    highlights      TEXT[],
    embedding_id    VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resume_experience (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id       UUID REFERENCES resumes(id) ON DELETE CASCADE,
    company         VARCHAR(255),
    title           VARCHAR(255),
    location        VARCHAR(255),
    start_date      DATE,
    end_date        DATE,                   -- NULL for current
    description     TEXT,
    achievements    TEXT[],
    skills_used     TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- JOB DESCRIPTIONS
-- =============================================

CREATE TABLE job_descriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    company         VARCHAR(255),
    raw_text        TEXT NOT NULL,
    parsed_data     JSONB DEFAULT '{}',
    embedding_id    VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jd_requirements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jd_id           UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    requirement     TEXT NOT NULL,
    category        VARCHAR(50),            -- 'skill', 'qualification', 'experience', 'soft_skill'
    priority        VARCHAR(20),            -- 'required', 'preferred', 'nice_to_have'
    confidence      DECIMAL(3,2),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE skill_gaps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jd_id           UUID REFERENCES job_descriptions(id) ON DELETE CASCADE,
    resume_id       UUID REFERENCES resumes(id) ON DELETE CASCADE,
    skill_name      VARCHAR(100) NOT NULL,
    status          VARCHAR(20) NOT NULL,   -- 'matched', 'partial', 'gap'
    match_score     DECIMAL(3,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MOCK INTERVIEWS
-- =============================================

CREATE TABLE interview_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    resume_id       UUID REFERENCES resumes(id),
    jd_id           UUID REFERENCES job_descriptions(id),
    type            VARCHAR(50) NOT NULL,   -- 'technical', 'behavioral', 'mixed', 'coding'
    status          VARCHAR(20) DEFAULT 'in_progress',
    overall_score   DECIMAL(3,2),
    feedback        JSONB DEFAULT '{}',     -- Detailed scoring breakdown
    duration_seconds INTEGER,
    question_count  INTEGER DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE TABLE interview_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   VARCHAR(50),            -- 'technical', 'behavioral', 'coding', 'follow_up'
    difficulty      VARCHAR(20),            -- 'easy', 'medium', 'hard'
    user_response   TEXT,
    ai_evaluation   JSONB DEFAULT '{}',     -- STAR compliance, correctness, clarity
    score           DECIMAL(3,2),
    time_limit_sec  INTEGER,
    time_taken_sec  INTEGER,
    follow_up_count INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MEETINGS
-- =============================================

CREATE TABLE meetings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    duration_seconds INTEGER,
    status          VARCHAR(20) DEFAULT 'in_progress', -- 'in_progress', 'completed'
    summary         TEXT,
    action_items    JSONB DEFAULT '[]',
    metadata        JSONB DEFAULT '{}'
);

CREATE TABLE meeting_transcripts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id      UUID REFERENCES meetings(id) ON DELETE CASCADE,
    speaker_label   VARCHAR(50),            -- 'Speaker 1', 'Speaker 2', or detected name
    content         TEXT NOT NULL,
    start_time      DECIMAL(10,3),          -- Seconds from meeting start
    end_time        DECIMAL(10,3),
    confidence      DECIMAL(3,2),
    is_ai_generated BOOLEAN DEFAULT false,  -- AI-generated notes vs raw transcript
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transcripts_meeting ON meeting_transcripts(meeting_id, start_time);

-- =============================================
-- TRANSCRIPTIONS (Standalone)
-- =============================================

CREATE TABLE transcripts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255),
    source          VARCHAR(50),            -- 'microphone', 'system_audio', 'file'
    language        VARCHAR(10) DEFAULT 'en',
    status          VARCHAR(20) DEFAULT 'recording',
    duration_seconds INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE TABLE transcript_segments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id   UUID REFERENCES transcripts(id) ON DELETE CASCADE,
    speaker_label   VARCHAR(50),
    content         TEXT NOT NULL,
    start_time      DECIMAL(10,3),
    end_time        DECIMAL(10,3),
    confidence      DECIMAL(3,2),
    words           JSONB,                  -- Word-level timestamps
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CODE ANALYSIS
-- =============================================

CREATE TABLE code_analyses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    language        VARCHAR(50) NOT NULL,
    source_code     TEXT NOT NULL,
    analysis_type   VARCHAR(50),            -- 'dsa', 'debug', 'optimize', 'explain'
    result          JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER SETTINGS
-- =============================================

CREATE TABLE user_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme           VARCHAR(20) DEFAULT 'system',
    font_size       INTEGER DEFAULT 14,
    primary_model   VARCHAR(100) DEFAULT 'gpt-4o',
    secondary_model VARCHAR(100) DEFAULT 'llama3.1',
    auto_model_selection BOOLEAN DEFAULT true,
    language        VARCHAR(10) DEFAULT 'en',
    overlay_shortcut VARCHAR(50) DEFAULT 'CmdOrCtrl+Shift+Space',
    transcription_shortcut VARCHAR(50) DEFAULT 'CmdOrCtrl+Shift+T',
    screenshot_shortcut VARCHAR(50) DEFAULT 'CmdOrCtrl+Shift+S',
    privacy_mode    BOOLEAN DEFAULT true,   -- Local processing preferred
    data_retention_days INTEGER DEFAULT 90,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VECTOR STORE METADATA (ChromaDB collections)
-- =============================================
-- ChromaDB manages its own storage, but we track references:

CREATE TABLE vector_collections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    collection_name VARCHAR(255) NOT NULL,  -- ChromaDB collection name
    source_type     VARCHAR(50) NOT NULL,   -- 'resume', 'job_description', 'conversation'
    source_id       UUID NOT NULL,          -- FK to source table
    document_count  INTEGER DEFAULT 0,
    last_updated    TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Redis Schema (Key Patterns)

```
# Session management
session:{session_id}                    → JWT token data (TTL: 24h)
refresh:{refresh_token}                 → User ID (TTL: 30d)

# Rate limiting
ratelimit:{user_id}:{endpoint}          → Request count (TTL: 1min)

# Active WebSocket connections
ws:users:{user_id}                      → Set of connection IDs
ws:transcription:{user_id}              → Active transcription session
ws:meeting:{meeting_id}                 → Active meeting connections

# Caching
cache:resume:{resume_id}:skills         → Cached skills JSON (TTL: 1h)
cache:jd:{jd_id}:requirements           → Cached requirements (TTL: 1h)
cache:model:list                        → Available Ollama models (TTL: 5min)

# Background job queues
queue:embedding                          → Jobs for embedding generation
queue:transcription                      → Jobs for batch transcription
queue:cleanup                            → Jobs for data cleanup

# AI conversation context
ai:context:{conversation_id}            → Recent message window (TTL: 2h)
ai:tokens:{user_id}                     → Token usage counter (TTL: 1d)
```

### ChromaDB Collections

```
resume_embeddings/
    ├── documents    → Resume text chunks
    ├── embeddings   → Sentence-transformer vectors (384d)
    ├── metadata     → {resume_id, chunk_type, section}
    └── ids          → {resume_id}_{chunk_index}

jd_embeddings/
    ├── documents    → JD text chunks
    ├── embeddings   → Sentence-transformer vectors (384d)
    ├── metadata     → {jd_id, requirement_type}
    └── ids          → {jd_id}_{chunk_index}

conversation_embeddings/
    ├── documents    → Conversation message chunks
    ├── embeddings   → Sentence-transformer vectors (384d)
    ├── metadata     → {conversation_id, role, timestamp}
    └── ids          → {conversation_id}_{message_index}

meeting_embeddings/
    ├── documents    → Meeting transcript segments
    ├── embeddings   → Sentence-transformer vectors (384d)
    ├── metadata     → {meeting_id, speaker, timestamp}
    └── ids          → {meeting_id}_{segment_index}
```

---

## 5. API Design

### REST Endpoints

```
Base URL: http://127.0.0.1:8000/api/v1

── Authentication ─────────────────────────────
POST   /auth/register              Register new user
POST   /auth/login                 Login (returns JWT)
POST   /auth/refresh               Refresh access token
GET    /auth/me                    Get current user
PUT    /auth/me                    Update user profile

── Conversations ─────────────────────────────
GET    /conversations              List user conversations
POST   /conversations              Create new conversation
GET    /conversations/:id          Get conversation details
PUT    /conversations/:id          Update conversation (title, model)
DELETE /conversations/:id          Archive conversation
GET    /conversations/:id/messages Get message history (paginated)
POST   /conversations/:id/messages Add user message

── Chat (AI) ─────────────────────────────────
POST   /chat/send                 Send message, get streaming response
POST   /chat/stop                  Stop streaming response
GET    /chat/models                List available models (GPT + Ollama)
POST   /chat/models/refresh        Refresh Ollama model list
GET    /chat/context/:id           Get conversation context for RAG

── Resume ────────────────────────────────────
GET    /resumes                    List user resumes
POST   /resumes/upload             Upload resume (PDF/DOCX)
GET    /resumes/:id                Get resume details
GET    /resumes/:id/insights       Get extracted insights
GET    /resumes/:id/skills         Get extracted skills
GET    /resumes/:id/experience     Get experience entries
GET    /resumes/:id/projects       Get project entries
POST   /resumes/:id/embeddings     Rebuild embeddings
DELETE /resumes/:id                Delete resume
POST   /resumes/:id/chat           Chat about resume content

── Job Descriptions ──────────────────────────
GET    /job-descriptions           List user JDs
POST   /job-descriptions           Create JD (text or file)
GET    /job-descriptions/:id       Get JD details
GET    /job-descriptions/:id/requirements  Get requirements
GET    /job-descriptions/:id/gap-analysis  Get skill gap analysis
POST   /job-descriptions/:id/generate-questions  Generate probable questions
DELETE /job-descriptions/:id       Delete JD

── Mock Interview ────────────────────────────
GET    /interviews                 List past interviews
POST   /interviews/start           Start new interview session
GET    /interviews/:id             Get interview details
POST   /interviews/:id/answer      Submit answer to question
POST   /interviews/:id/next        Request next question
POST   /interviews/:id/complete    End interview, get feedback
GET    /interviews/:id/feedback    Get detailed feedback

── Transcription ─────────────────────────────
GET    /transcriptions             List past transcriptions
POST   /transcriptions             Start new transcription session
GET    /transcriptions/:id         Get transcription details
GET    /transcriptions/:id/segments Get transcript segments
GET    /transcriptions/:id/search  Search within transcription
POST   /transcriptions/:id/export  Export as SRT/TXT/PDF
DELETE /transcriptions/:id         Delete transcription

── OCR ───────────────────────────────────────
POST   /ocr/extract               Extract text from image
POST   /ocr/explain               Explain image content via vision LLM
POST   /ocr/screenshot            Capture and process screenshot

── Meetings ──────────────────────────────────
GET    /meetings                   List past meetings
POST   /meetings/start             Start new meeting session
GET    /meetings/:id               Get meeting details
GET    /meetings/:id/transcript    Get meeting transcript
GET    /meetings/:id/notes         Get AI-generated notes
GET    /meetings/:id/action-items  Get extracted action items
GET    /meetings/:id/summary       Get meeting summary
POST   /meetings/:id/search        Search across meeting transcripts
DELETE /meetings/:id               Delete meeting

── Coding ────────────────────────────────────
POST   /coding/analyze             Analyze code (DSA, complexity)
POST   /coding/explain             Explain code
POST   /coding/optimize            Suggest optimizations
POST   /coding/debug               Debug assistance

── Settings ──────────────────────────────────
GET    /settings                   Get user settings
PUT    /settings                   Update settings
POST   /settings/api-keys          Add/update API key
DELETE /settings/api-keys/:id      Remove API key
GET    /settings/api-keys          List API keys (masked)
POST   /settings/export            Export all user data
POST   /settings/delete-account    Delete account and data

── System ────────────────────────────────────
GET    /health                     Backend health check
GET    /platform                   Platform info (OS, Python, GPU)
GET    /version                    App version info
```

### WebSocket Endpoints

```
ws://127.0.0.1:8000/ws/chat/{conversation_id}
    Client → Server: { type: "message", content: string }
    Client → Server: { type: "stop" }
    Server → Client: { type: "token", content: string }
    Server → Client: { type: "done", message_id: string, tokens_used: int }
    Server → Client: { type: "error", message: string }

ws://127.0.0.1:8000/ws/transcription/{session_id}
    Client → Server: { type: "audio_chunk", data: base64, sample_rate: int }
    Client → Server: { type: "stop" }
    Server → Client: { type: "partial", text: string, speaker: string }
    Server → Client: { type: "final", text: string, speaker: string, timestamps: object }
    Server → Client: { type: "vad", speaking: boolean, level: float }

ws://127.0.0.1:8000/ws/meeting/{meeting_id}
    Client → Server: { type: "audio_chunk", data: base64 }
    Client → Server: { type: "stop" }
    Server → Client: { type: "transcript", speaker: string, text: string }
    Server → Client: { type: "note", content: string }
    Server → Client: { type: "action_item", item: object }
    Server → Client: { type: "summary", content: string }
```

### SSE Endpoints (Alternative to WebSocket)

```
GET /api/v1/chat/stream?conversation_id={id}&message={text}
    Event: token
    Data: {"content": "partial text"}

    Event: done
    Data: {"message_id": "uuid", "tokens_used": 42}

    Event: error
    Data: {"message": "Rate limit exceeded"}
```

---

## 6. Frontend Architecture

### Component Hierarchy

```
App
├── ThemeProvider (dark/light mode)
├── Toaster (notification system)
├── CommandPalette (Cmd+K)
│
├── AppShell
│   ├── Sidebar
│   │   ├── Logo
│   │   ├── NavigationItems
│   │   │   ├── Chat
│   │   │   ├── Transcript
│   │   │   ├── Resume
│   │   │   ├── Mock Interview
│   │   │   ├── Coding Assistant
│   │   │   ├── Meeting
│   │   │   └── Settings
│   │   ├── ModelIndicator
│   │   └── UserMenu
│   │
│   ├── MainContent (Routes)
│   │   ├── ChatPage
│   │   │   ├── ConversationList
│   │   │   ├── ChatPanel
│   │   │   │   ├── MessageList
│   │   │   │   │   └── MessageBubble × N
│   │   │   │   │       ├── MarkdownRenderer
│   │   │   │   │       └── CodeBlock (inline)
│   │   │   │   ├── StreamingText (during generation)
│   │   │   │   └── MessageInput
│   │   │   │       ├── TextArea
│   │   │   │       ├── FileUploadButton
│   │   │   │       ├── ModelSelector
│   │   │   │       └── SendButton
│   │   │   └── TokenCounter
│   │   │
│   │   ├── TranscriptPage
│   │   │   ├── AudioLevelMeter
│   │   │   ├── TranscriptPanel
│   │   │   │   ├── TranscriptEntry × N
│   │   │   │   │   ├── SpeakerLabel
│   │   │   │   │   └── TimestampBadge
│   │   │   │   └── TranscriptSearch
│   │   │   └── RecordingControls
│   │   │       ├── RecordButton
│   │   │       ├── PauseButton
│   │   │       ├── StopButton
│   │   │       └── ExportButton
│   │   │
│   │   ├── ResumePage
│   │   │   ├── ResumeUpload (drag & drop zone)
│   │   │   ├── ResumeInsights
│   │   │   │   ├── SkillMatrix
│   │   │   │   ├── ExperienceTimeline
│   │   │   │   └── ProjectShowcase
│   │   │   └── ResumeChat
│   │   │
│   │   ├── InterviewPage
│   │   │   ├── InterviewDashboard
│   │   │   │   ├── InterviewSetup
│   │   │   │   │   ├── TypeSelector (technical/behavioral/coding)
│   │   │   │   │   ├── ResumeSelector
│   │   │   │   │   ├── JDSelector
│   │   │   │   │   └── DifficultySelector
│   │   │   │   └── InterviewHistory
│   │   │   ├── InterviewSession
│   │   │   │   ├── QuestionCard
│   │   │   │   │   ├── QuestionText
│   │   │   │   │   └── QuestionType Badge
│   │   │   │   ├── TimerWidget
│   │   │   │   ├── ResponseArea
│   │   │   │   │   └── TextArea / CodeEditor
│   │   │   │   ├── STARCoach (behavioral)
│   │   │   │   ├── CodingSandbox (coding)
│   │   │   │   └── SubmitControls
│   │   │   └── InterviewFeedback
│   │   │       ├── OverallScore
│   │   │       ├── QuestionBreakdown
│   │   │       ├── STARCompliance
│   │   │       ├── ImprovementAreas
│   │   │       └── ExportButton
│   │   │
│   │   ├── CodingPage
│   │   │   ├── CodeEditor (Monaco)
│   │   │   ├── LanguageSelector
│   │   │   ├── CodeExplainer
│   │   │   ├── ComplexityAnalyzer
│   │   │   └── OptimizationPanel
│   │   │
│   │   ├── MeetingPage
│   │   │   ├── MeetingDashboard
│   │   │   │   ├── MeetingList
│   │   │   │   └── NewMeetingButton
│   │   │   ├── MeetingSession
│   │   │   │   ├── LiveTranscript
│   │   │   │   ├── MeetingNotes (real-time)
│   │   │   │   └── ActionItems
│   │   │   └── MeetingHistory
│   │   │       ├── MeetingSummary
│   │   │       └── MeetingSearch
│   │   │
│   │   └── SettingsPage
│   │       ├── AISettings
│   │       │   ├── APIKeyManager
│   │       │   ├── ModelPreferences
│   │       │   └── OllamaConfig
│   │       ├── AudioSettings
│   │       ├── AppearanceSettings
│   │       ├── KeyboardSettings
│   │       ├── SecuritySettings
│   │       └── AboutPage
│   │
│   └── StatusBar
│       ├── BackendIndicator
│       ├── ModelIndicator
│       └── QuickActions
│
└── OverlayWindow (Separate BrowserWindow)
    ├── OverlayPanel
    │   ├── CompactChat
    │   ├── QuickAnswer
    │   └── TranscriptionHUD
    └── QuickToggle
```

### State Management (Zustand Stores)

```typescript
// stores/app-store.ts
interface AppState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  activeView: ViewType
  backendStatus: 'connected' | 'disconnected' | 'starting'
  ollamaStatus: 'available' | 'unavailable'
  setTheme: (theme: string) => void
  toggleSidebar: () => void
  setActiveView: (view: ViewType) => void
}

// stores/chat-store.ts
interface ChatState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  isStreaming: boolean
  streamingContent: string
  selectedModel: { provider: string; name: string }
  sendMessage: (content: string) => Promise<void>
  stopStreaming: () => void
  selectModel: (provider: string, name: string) => void
}

// stores/transcript-store.ts
interface TranscriptState {
  isRecording: boolean
  currentTranscriptId: string | null
  segments: TranscriptSegment[]
  partialText: string
  audioLevel: number
  speaker: string
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
}
```

### Keyboard Shortcuts

```
Cmd+K              — Command palette
Cmd+Shift+Space    — Toggle overlay window
Cmd+Shift+T        — Start/stop transcription
Cmd+Shift+S        — Screenshot + OCR
Cmd+Shift+M        — Quick mock interview
Cmd+Shift+N        — New conversation
Cmd+Shift+L        — Toggle dark/light mode
Cmd+1-7            — Navigate to view (1=Chat, 2=Transcript, etc.)
Cmd+.              — Toggle sidebar
Escape             — Close overlay / dismiss modal
Cmd+Enter          — Send message
Cmd+Shift+Enter    — Send + new line
```

### IPC Contract (Electron Main ↔ Renderer)

```typescript
// electron/shared/ipc-types.ts

interface ElectronAPI {
  // Window management
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    setAlwaysOnTop: (flag: boolean, level?: string) => Promise<void>
    setContentProtection: (enabled: boolean) => Promise<void>
    setIgnoreMouseEvents: (ignore: boolean) => Promise<void>
    showOverlay: () => Promise<void>
    hideOverlay: () => Promise<void>
  }

  // File operations
  file: {
    openDialog: (options: OpenDialogOptions) => Promise<string[]>
    saveDialog: (options: SaveDialogOptions) => Promise<string>
    readFile: (path: string) => Promise<Buffer>
    writeFile: (path: string, data: Buffer) => Promise<void>
    getDocumentsPath: () => Promise<string>
  }

  // Backend communication
  backend: {
    getStatus: () => Promise<'running' | 'stopped'>
    start: () => Promise<void>
    stop: () => Promise<void>
    healthCheck: () => Promise<boolean>
  }

  // Settings
  settings: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }

  // Global shortcuts
  shortcuts: {
    register: (accelerator: string, callback: () => void) => Promise<void>
    unregister: (accelerator: string) => Promise<void>
  }

  // Events from main process
  onBackendStatus: (callback: (status: string) => void) => void
  onOverlayToggle: (callback: () => void) => void
  onTranscriptionToggle: (callback: () => void) => void
  onScreenshotCapture: (callback: (imagePath: string) => void) => void
}
```

---

## 7. AI/ML Integration Layer

### Model Router (Auto Selection)

```python
# backend/app/services/ai/model_router.py

from enum import Enum
from typing import Optional

class ModelProvider(str, Enum):
    OPENAI = "openai"
    OLLAMA = "ollama"

class TaskType(str, Enum):
    CHAT = "chat"
    COMPLEX_REASONING = "complex_reasoning"
    CODE_EXPLANATION = "code_explanation"
    SUMMARIZATION = "summarization"
    EXTRACTION = "extraction"
    VISION = "vision"

class ModelRouter:
    """Automatically selects the best model based on task, availability, and user preferences."""

    MODEL_CAPABILITIES = {
        "gpt-4o": {
            "provider": ModelProvider.OPENAI,
            "capabilities": [TaskType.CHAT, TaskType.COMPLEX_REASONING,
                           TaskType.CODE_EXPLANATION, TaskType.VISION],
            "max_tokens": 128000,
            "cost_per_1k": 0.005,
        },
        "gpt-4o-mini": {
            "provider": ModelProvider.OPENAI,
            "capabilities": [TaskType.CHAT, TaskType.SUMMARIZATION, TaskType.EXTRACTION],
            "max_tokens": 128000,
            "cost_per_1k": 0.00015,
        },
        "llama3.1:8b": {
            "provider": ModelProvider.OLLAMA,
            "capabilities": [TaskType.CHAT, TaskType.SUMMARIZATION],
            "max_tokens": 128000,
            "cost_per_1k": 0,
        },
        "llama3.1:70b": {
            "provider": ModelProvider.OLLAMA,
            "capabilities": [TaskType.CHAT, TaskType.COMPLEX_REASONING,
                           TaskType.CODE_EXPLANATION],
            "max_tokens": 128000,
            "cost_per_1k": 0,
        },
        "codellama:34b": {
            "provider": ModelProvider.OLLAMA,
            "capabilities": [TaskType.CODE_EXPLANATION],
            "max_tokens": 16384,
            "cost_per_1k": 0,
        },
        "llava:13b": {
            "provider": ModelProvider.OLLAMA,
            "capabilities": [TaskType.VISION],
            "max_tokens": 4096,
            "cost_per_1k": 0,
        },
    }

    async def select_model(
        self,
        task: TaskType,
        user_preference: Optional[str] = None,
        requires_vision: bool = False,
        context_length: int = 0,
    ) -> tuple[ModelProvider, str]:
        """Select the best model for the given task."""

        # 1. Check user preference
        if user_preference and user_preference in self.MODEL_CAPABILITIES:
            caps = self.MODEL_CAPABILITIES[user_preference]
            if task in caps["capabilities"]:
                return caps["provider"], user_preference

        # 2. Auto-select based on task complexity
        if task == TaskType.VISION:
            # Prefer GPT-4o for vision, fallback to llava
            if await self._check_openai_available():
                return ModelProvider.OPENAI, "gpt-4o"
            return ModelProvider.OLLAMA, "llava:13b"

        if task in (TaskType.COMPLEX_REASONING, TaskType.CODE_EXPLANATION):
            # Prefer more capable models
            if await self._check_openai_available():
                return ModelProvider.OPENAI, "gpt-4o"
            if await self._check_ollama_model("llama3.1:70b"):
                return ModelProvider.OLLAMA, "llama3.1:70b"
            return ModelProvider.OLLAMA, "llama3.1:8b"

        # Default: use local LLM for simple tasks (privacy + cost)
        if await self._check_ollama_model("llama3.1:8b"):
            return ModelProvider.OLLAMA, "llama3.1:8b"

        if await self._check_openai_available():
            return ModelProvider.OPENAI, "gpt-4o-mini"

        raise RuntimeError("No AI models available. Configure OpenAI API key or install Ollama.")
```

### Conversation Memory with RAG

```python
# backend/app/services/ai/conversation_memory.py

from typing import List, Optional
from ..resume.vector_store import VectorStoreService

class ConversationMemory:
    """Manages conversation context with RAG-augmented responses."""

    def __init__(self, vector_store: VectorStoreService):
        self.vector_store = vector_store
        self.max_context_tokens = 8000
        self.recent_window = 20  # Last 20 messages kept in full

    async def build_context(
        self,
        conversation_id: str,
        user_message: str,
        resume_id: Optional[str] = None,
        jd_id: Optional[str] = None,
    ) -> List[dict]:
        """Build context window with recent messages + RAG-relevant context."""

        context = []

        # 1. Retrieve relevant resume context
        if resume_id:
            resume_chunks = await self.vector_store.search(
                collection="resume_embeddings",
                query=user_message,
                n_results=3,
                filter={"resume_id": resume_id},
            )
            if resume_chunks:
                context.append({
                    "role": "system",
                    "content": f"Relevant resume context:\n{self._format_chunks(resume_chunks)}"
                })

        # 2. Retrieve relevant JD context
        if jd_id:
            jd_chunks = await self.vector_store.search(
                collection="jd_embeddings",
                query=user_message,
                n_results=2,
                filter={"jd_id": jd_id},
            )
            if jd_chunks:
                context.append({
                    "role": "system",
                    "content": f"Relevant job description context:\n{self._format_chunks(jd_chunks)}"
                })

        # 3. Retrieve relevant past conversations
        past_chunks = await self.vector_store.search(
            collection="conversation_embeddings",
            query=user_message,
            n_results=3,
        )
        if past_chunks:
            context.append({
                "role": "system",
                "content": f"Relevant past discussion:\n{self._format_chunks(past_chunks)}"
            })

        # 4. Add recent conversation messages
        recent_messages = await self._get_recent_messages(
            conversation_id, limit=self.recent_window
        )
        context.extend(recent_messages)

        return context

    def _format_chunks(self, chunks: List[dict]) -> str:
        formatted = []
        for chunk in chunks:
            source = chunk["metadata"].get("source", "unknown")
            formatted.append(f"[Source: {source}]\n{chunk['document']}")
        return "\n\n---\n\n".join(formatted)
```

### Streaming Architecture

```python
# backend/app/services/ai/streaming.py

import asyncio
import json
from typing import AsyncGenerator

class AIStreamManager:
    """Manages streaming AI responses with cancellation support."""

    def __init__(self):
        self.active_streams: dict[str, asyncio.Event] = {}

    async def stream_chat(
        self,
        conversation_id: str,
        messages: list[dict],
        model_provider: str,
        model_name: str,
    ) -> AsyncGenerator[str, None]:
        """Stream tokens from the selected AI provider."""

        stop_event = asyncio.Event()
        self.active_streams[conversation_id] = stop_event

        try:
            if model_provider == "openai":
                async for token in self._stream_openai(messages, model_name, stop_event):
                    yield token
            elif model_provider == "ollama":
                async for token in self._stream_ollama(messages, model_name, stop_event):
                    yield token
        finally:
            self.active_streams.pop(conversation_id, None)

    async def _stream_openai(
        self, messages: list, model: str, stop_event: asyncio.Event
    ) -> AsyncGenerator[str, None]:
        from openai import AsyncOpenAI
        client = AsyncOpenAI()

        stream = await client.chat.completions.create(
            model=model,
            messages=messages,
            stream=True,
        )

        async for chunk in stream:
            if stop_event.is_set():
                await stream.close()
                break
            content = chunk.choices[0].delta.content
            if content:
                yield content

    async def _stream_ollama(
        self, messages: list, model: str, stop_event: asyncio.Event
    ) -> AsyncGenerator[str, None]:
        import httpx

        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                "http://localhost:11434/api/chat",
                json={"model": model, "messages": messages, "stream": True},
                timeout=120.0,
            ) as response:
                async for line in response.aiter_lines():
                    if stop_event.is_set():
                        break
                    data = json.loads(line)
                    content = data.get("message", {}).get("content", "")
                    if content:
                        yield content

    def stop_stream(self, conversation_id: str):
        event = self.active_streams.get(conversation_id)
        if event:
            event.set()
```

---

## 8. Speech Processing Pipeline

### Real-Time Transcription Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Audio Capture Layer                  │
│  PyAudio (16kHz mono) → Ring Buffer (5s chunks)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Voice Activity Detection                │
│  Silero VAD (30ms windows, threshold: 0.5)         │
│  → Speech segments (5-30s) + silence removal        │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│            Speaker Diarization (Optional)            │
│  pyannote.audio or simple energy-based detection    │
│  → Speaker labels (Speaker 1, Speaker 2, ...)      │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│           Faster-Whisper Transcription              │
│  Model: base.en (real-time) or large-v3 (quality)  │
│  beam_size=1, vad_filter=True, int8 quantization   │
│  → Text + word-level timestamps                    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Output Pipeline                         │
│  1. WebSocket → Renderer (live display)             │
│  2. PostgreSQL → transcript_segments (persistence)  │
│  3. ChromaDB → meeting_embeddings (searchability)   │
│  4. Redis → session cache (real-time state)         │
└─────────────────────────────────────────────────────┘
```

### Audio Processing Service

```python
# backend/app/services/speech/transcription_service.py

import asyncio
import numpy as np
from faster_whisper import WhisperModel
from .vad_service import SileroVAD

class TranscriptionService:
    """Real-time transcription using Faster-Whisper + Silero VAD."""

    def __init__(self, model_size: str = "base.en"):
        self.model = WhisperModel(
            model_size,
            device="auto",  # CUDA if available, else CPU
            compute_type="int8" if not self._has_gpu() else "float16",
        )
        self.vad = SileroVAD(threshold=0.5, sample_rate=16000)
        self.sample_rate = 16000
        self.chunk_duration = 5  # seconds

    async def transcribe_stream(
        self,
        audio_stream: AsyncGenerator[np.ndarray, None],
        session_id: str,
    ) -> AsyncGenerator[dict, None]:
        """Transcribe audio stream in real-time."""

        buffer = []
        async for audio_chunk in audio_stream:
            # VAD: check if speech is present
            is_speech, speech_prob = self.vad.detect(audio_chunk)

            if is_speech:
                buffer.append(audio_chunk)

                # Transcribe when we have enough audio
                if len(buffer) * self.chunk_duration >= self.chunk_duration:
                    audio_data = np.concatenate(buffer)
                    result = await self._transcribe_chunk(audio_data)

                    if result["text"].strip():
                        yield {
                            "type": "final",
                            "text": result["text"],
                            "speaker": result.get("speaker", "Speaker 1"),
                            "timestamps": result.get("timestamps", {}),
                            "confidence": result.get("confidence", 0.0),
                        }

                    buffer = []
            else:
                # End of speech segment
                if buffer:
                    audio_data = np.concatenate(buffer)
                    result = await self._transcribe_chunk(audio_data)

                    if result["text"].strip():
                        yield {
                            "type": "final",
                            "text": result["text"],
                            "speaker": result.get("speaker", "Speaker 1"),
                            "timestamps": result.get("timestamps", {}),
                            "confidence": result.get("confidence", 0.0),
                        }

                    buffer = []

                yield {"type": "vad", "speaking": False, "level": 0.0}

    async def _transcribe_chunk(self, audio_data: np.ndarray) -> dict:
        """Transcribe a single audio chunk."""

        def _run():
            segments, info = self.model.transcribe(
                audio_data,
                beam_size=1,
                vad_filter=True,
                word_timestamps=True,
                language="en",
            )

            full_text = ""
            words = []
            for segment in segments:
                full_text += segment.text
                if segment.words:
                    words.extend([
                        {"word": w.word, "start": w.start, "end": w.end}
                        for w in segment.words
                    ])

            return {
                "text": full_text.strip(),
                "language": info.language,
                "confidence": info.language_probability,
                "timestamps": {"words": words} if words else None,
            }

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _run)

    def _has_gpu(self) -> bool:
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
```

---

## 9. Security Architecture

### Encryption at Rest

```
User Data Encryption Flow:
1. On first launch, generate or load master key from system keychain
   - macOS: Keychain Services
   - Windows: DPAPI
   - Linux: Secret Service API (gnome-keyring)
2. User data encrypted with AES-256-GCM before disk write
3. API keys encrypted with user-specific derived key
4. Database encrypted via SQLCipher (PostgreSQL extension)

Key Hierarchy:
Master Key (system keychain)
├── Data Encryption Key (DEK) — encrypts user data
├── API Key Encryption Key — encrypts stored API keys
└── Session Key — encrypts active session data
```

### Privacy-First Design

```
Data Flow Privacy Rules:
1. LOCAL PROCESSING PREFERRED
   - Ollama models run 100% locally
   - Transcription via Faster-Whisper runs locally
   - OCR via EasyOCR runs locally
   - Embeddings via sentence-transformers runs locally

2. CLOUD PROCESSING (when local unavailable)
   - Only send data when user explicitly uses GPT
   - Never send resume/JD data without user consent
   - Redact PII before sending to cloud APIs
   - Streaming responses only — no server-side storage

3. NETWORK RULES
   - No telemetry by default
   - No analytics without explicit opt-in
   - All API calls over HTTPS only
   - Certificate pinning for known endpoints
   - No data leaves the machine without user action

4. DATA RETENTION
   - Configurable retention period (default: 90 days)
   - Manual data export + deletion
   - Secure deletion (overwrite before delete)
```

### API Key Storage

```python
# backend/app/security.py

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os

class SecureKeyStore:
    """Encrypted storage for API keys using system keychain + AES-256."""

    def __init__(self, master_key: bytes):
        self.fernet = Fernet(self._derive_key(master_key))

    def encrypt_api_key(self, api_key: str) -> str:
        """Encrypt an API key for storage."""
        encrypted = self.fernet.encrypt(api_key.encode())
        return base64.b64encode(encrypted).decode()

    def decrypt_api_key(self, encrypted_key: str) -> str:
        """Decrypt a stored API key."""
        decrypted = self.fernet.decrypt(base64.b64decode(encrypted_key))
        return decrypted.decode()

    def _derive_key(self, master_key: bytes) -> bytes:
        """Derive Fernet key from master key."""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"interview-copilot-salt",  # In production, use unique salt
            iterations=480000,
        )
        return base64.urlsafe_b64encode(kdf.derive(master_key))
```

---

## 10. Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

```
Week 1-2: Project Setup
├── Initialize electron-vite project
├── Configure TypeScript + Tailwind CSS v4
├── Set up shadcn/ui components
├── Create Python FastAPI backend scaffold
├── Set up PostgreSQL + Redis
├── Configure ChromaDB
├── Implement Electron IPC layer
├── Set up authentication (JWT)
└── Create base layout (AppShell, Sidebar, Header)

Week 3-4: Core Infrastructure
├── Implement backend API router
├── Create database models + migrations
├── Set up Zustand stores
├── Build chat interface (basic)
├── Integrate OpenAI streaming
├── Integrate Ollama
├── Implement model router
└── Basic error handling + notifications
```

### Phase 2: Core Features (Weeks 5-10)

```
Week 5-6: AI Chat + Transcription
├── Full chat interface with streaming
├── Conversation management (CRUD)
├── Faster-Whisper integration
├── Real-time transcription WebSocket
├── Speaker detection
├── Transcript persistence + search
└── Audio device selection

Week 7-8: Resume + Job Description
├── PDF/DOCX upload + parsing
├── Skill extraction (NLP)
├── Experience/project extraction
├── ChromaDB embedding pipeline
├── Resume-based chat (RAG)
├── JD upload + parsing
├── Skill gap analysis
└── Probable question generation

Week 9-10: Mock Interview + Coding
├── Interview session management
├── Question generation engine
├── STAR method evaluation
├── Timed responses
├── Coding sandbox (Monaco)
├── Code analysis (DSA, complexity)
├── Interview feedback + scoring
└── Interview history
```

### Phase 3: Advanced Features (Weeks 11-14)

```
Week 11-12: Meeting + OCR
├── Meeting session management
├── Live meeting transcription
├── AI note generation
├── Action item extraction
├── Meeting summary
├── Cross-meeting search
├── Screenshot capture
├── OCR extraction (EasyOCR)
├── Vision LLM integration
└── Image explanation

Week 13-14: Stealth Overlay + Polish
├── Overlay window (transparent, always-on-top)
├── Content protection (invisible to screen capture)
├── Global keyboard shortcuts
├── System tray integration
├── Dark/light mode polish
├── Animations (Framer Motion)
├── Command palette (Cmd+K)
├── Settings page
└── Performance optimization
```

### Phase 4: Production (Weeks 15-18)

```
Week 15-16: Security + Testing
├── Encryption at rest implementation
├── Secure API key storage
├── Privacy mode enforcement
├── Unit tests (backend + frontend)
├── Integration tests
├── E2E tests
└── Security audit

Week 17-18: Packaging + Deployment
├── PyInstaller backend bundling
├── electron-builder configuration
├── Code signing (macOS, Windows)
├── Auto-update mechanism
├── Platform-specific builds
├── Installation testing
├── Documentation
└── Performance optimization
```

---

## 11. Testing Strategy

### Unit Tests

```
Backend (pytest):
├── services/ai/test_model_router.py
├── services/ai/test_conversation_memory.py
├── services/speech/test_transcription_service.py
├── services/resume/test_resume_parser.py
├── services/resume/test_skill_extractor.py
├── services/job_description/test_gap_analyzer.py
├── services/mock_interview/test_star_coach.py
├── services/ocr/test_ocr_service.py
├── repositories/test_user_repository.py
├── repositories/test_conversation_repository.py
└── schemas/test_api_schemas.py

Frontend (Vitest + React Testing Library):
├── stores/test_chat_store.ts
├── stores/test_transcript_store.ts
├── hooks/test_useChat.ts
├── hooks/test_useTranscription.ts
├── components/ui/test_button.tsx
├── features/chat/components/test_MessageBubble.tsx
├── features/chat/components/test_ChatPanel.tsx
├── features/resume/components/test_ResumeUpload.tsx
└── features/mock-interview/components/test_QuestionCard.tsx
```

### Integration Tests

```
API Integration Tests:
├── test_chat_flow.py (send message → streaming response)
├── test_transcription_flow.py (audio → transcript segments)
├── test_resume_flow.py (upload → parse → embed → search)
├── test_interview_flow.py (start → questions → feedback)
├── test_meeting_flow.py (start → transcribe → summarize)
└── test_auth_flow.py (register → login → refresh)
```

### E2E Tests (Playwright)

```
E2E Tests:
├── test_chat_e2e.py
├── test_transcription_e2e.py
├── test_resume_upload_e2e.py
├── test_mock_interview_e2e.py
├── test_overlay_e2e.py
└── test_settings_e2e.py
```

### Test Configuration

```python
# pytest.ini
[pytest]
testpaths = backend/tests
asyncio_mode = auto
markers =
    unit: Unit tests
    integration: Integration tests
    e2e: End-to-end tests
    slow: Tests that take >5s
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
```

---

## 12. Deployment Guide

### Development Setup

```bash
# 1. Clone and install
git clone <repo-url> interview-copilot
cd interview-copilot
npm install

# 2. Set up Python backend
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# 3. Set up PostgreSQL
createdb interview_copilot
alembic upgrade head

# 4. Set up Redis
redis-server  # default port 6379

# 5. Configure environment
cp .env.example .env
# Edit .env with your settings

# 6. Start development
npm run dev  # Starts both Electron and FastAPI
```

### Production Build

```bash
# 1. Build Python backend with PyInstaller
cd backend
pyinstaller --onefile --name backend \
  --add-data "alembic:alembic" \
  --add-data "alembic.ini:." \
  main.py

# 2. Build Electron app
cd ..
npm run build  # electron-builder
# Outputs: release/Interview Copilot-1.0.0.dmg (macOS)
#          release/Interview Copilot Setup 1.0.0.exe (Windows)
#          release/Interview Copilot-1.0.0.AppImage (Linux)
```

### electron-builder.yml

```yaml
appId: com.interviewcopilot.app
productName: Interview Copilot
copyright: Copyright © 2025

directories:
  output: release
  buildResources: build

files:
  - dist/**/*
  - "dist-python/**/*"

extraResources:
  - from: "backend/dist/backend"
    to: "backend/backend"
  - from: "backend/alembic"
    to: "backend/alembic"
  - from: "backend/alembic.ini"
    to: "backend/alembic.ini"

mac:
  category: public.app-category.productivity
  icon: build/icon.icns
  hardenedRuntime: true
  notarize: true
  target:
    - dmg
    - zip

win:
  icon: build/icon.ico
  target:
    - nsis
    - portable

linux:
  icon: build/icon.png
  target:
    - AppImage
    - deb
  category: Utility

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
```

---

## 13. Performance Optimisation

### Backend Optimisation

```
1. Database
   - Connection pooling (SQLAlchemy pool_size=10, max_overflow=20)
   - Indexes on frequently queried columns
   - PostgreSQL materialized views for complex analytics
   - Redis caching for hot data (model lists, recent conversations)

2. AI/ML
   - Model loading: Lazy-load models on first use
   - Embedding batching: Process multiple documents in parallel
   - ChromaDB: HNSW index for fast approximate nearest neighbor
   - Faster-Whisper: int8 quantization, beam_size=1 for real-time
   - Connection pooling for Ollama (single request at a time)

3. API
   - Response compression (gzip/brotli)
   - Request batching for multiple endpoints
   - SSE for streaming (lower overhead than WebSocket)
   - Background task queue for heavy operations (embedding, transcription)
```

### Frontend Optimisation

```
1. Rendering
   - React.memo() for message components (re-render on new messages only)
   - Virtual scrolling for long chat history (react-window)
   - Lazy loading for feature modules (React.lazy + Suspense)
   - Code splitting by route

2. State Management
   - Zustand selector optimization (shallow equality)
   - Normalize state to avoid duplication
   - Debounce rapid state updates (audio levels, partial transcripts)
   - Persist only essential state to localStorage

3. Network
   - WebSocket connection pooling
   - Request deduplication
   - Optimistic updates for UI responsiveness
   - Cache-first strategy for static data

4. Electron
   - Minimize IPC calls (batch operations)
   - Use MessagePort for high-throughput streaming
   - Offload heavy processing to utility process
   - Window state persistence
```

### Memory Management

```
Python Backend:
- Monitor VRAM/RAM usage during transcription
- Unload models when not in active use
- Use generators instead of lists for streaming data
- Implement request timeouts for long-running operations
- Background cleanup of old embeddings

Electron:
- Limit conversation history in memory (paginated loading)
- Garbage collection hints after large operations
- Off-screen rendering for overlay window
- Detach DevTools in production
```

---

## Appendix A: Package Dependencies

### Frontend (package.json)

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^12.0.0",
    "lucide-react": "^0.460.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.6.0",
    "date-fns": "^4.1.0",
    "react-markdown": "^9.0.0",
    "react-syntax-highlighter": "^15.6.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "devDependencies": {
    "electron": "^35.0.0",
    "electron-vite": "^3.0.0",
    "electron-builder": "^25.0.0",
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "playwright": "^1.50.0"
  }
}
```

### Backend (requirements.txt)

```
# Web framework
fastapi==0.115.0
uvicorn[standard]==0.34.0
python-multipart==0.0.17

# Database
sqlalchemy[asyncio]==2.0.36
asyncpg==0.30.0
alembic==1.14.0
redis[hiredis]==5.2.0

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# AI/ML
openai==1.58.0
ollama==0.4.0
sentence-transformers==3.4.0
chromadb==0.6.0

# Speech
faster-whisper==1.1.0
silero-vad==5.1.0
sounddevice==0.5.0
numpy==2.0.0

# OCR
easyocr==1.7.2

# Document processing
pymupdf==1.25.0
python-docx==1.1.2

# Security
cryptography==44.0.0
pydantic[email]==2.10.0
pydantic-settings==2.7.0

# Utilities
httpx==0.28.0
aiofiles==24.1.0
python-dotenv==1.0.1
```

---

## Appendix B: Environment Variables

```env
# .env.example

# Backend
BACKEND_PORT=8000
BACKEND_HOST=127.0.0.1
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/interview_copilot
REDIS_URL=redis://localhost:6379/0

# AI
OPENAI_API_KEY=sk-your-openai-key
OLLAMA_BASE_URL=http://localhost:11434

# Encryption
MASTER_KEY=auto-generated-on-first-run

# Speech
WHISPER_MODEL_SIZE=base.en
SAMPLE_RATE=16000

# App
APP_ENV=development
LOG_LEVEL=INFO
```

---

*Document version: 1.0.0*
*Last updated: July 2026*
*Architecture: Clean Architecture with Feature-Based Organization*
