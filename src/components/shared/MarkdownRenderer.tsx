import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none"
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const language = match ? match[1] : ''
          const codeString = String(children).replace(/\n$/, '')

          // Detect if inline code (no newlines and short)
          const isInline = !codeString.includes('\n')

          if (!isInline && language) {
            return (
              <CodeBlock language={language} value={codeString} />
            )
          }

          return (
            <code
              className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          )
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        ul({ children }) {
          return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
        },
        li({ children }) {
          return <li>{children}</li>
        },
        strong({ children }) {
          return <strong className="font-semibold">{children}</strong>
        },
        em({ children }) {
          return <em className="italic">{children}</em>
        },
        a({ href, children }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {children}
            </a>
          )
        },
        blockquote({ children }) {
          return (
            <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          )
        },
        h1({ children }) {
          return <h1 className="text-2xl font-bold mb-2">{children}</h1>
        },
        h2({ children }) {
          return <h2 className="text-xl font-bold mb-2">{children}</h2>
        },
        h3({ children }) {
          return <h3 className="text-lg font-bold mb-2">{children}</h3>
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto mb-2">
              <table className="min-w-full border border-border rounded-lg">
                {children}
              </table>
            </div>
          )
        },
        thead({ children }) {
          return <thead className="bg-muted">{children}</thead>
        },
        tbody({ children }) {
          return <tbody>{children}</tbody>
        },
        tr({ children }) {
          return <tr className="border-b border-border">{children}</tr>
        },
        th({ children }) {
          return <th className="px-4 py-2 text-left font-medium">{children}</th>
        },
        td({ children }) {
          return <td className="px-4 py-2">{children}</td>
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-lg overflow-hidden my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1b26] border-b border-white/10">
        <span className="text-xs text-gray-400 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem'
        }}
        showLineNumbers
        wrapLongLines
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
