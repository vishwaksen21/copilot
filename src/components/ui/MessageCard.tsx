import React from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { cn } from '../../lib/utils'

export interface MessageCardProps {
  role: 'user' | 'assistant'
  content: string
  className?: string
}

export function MessageCard({ role, content, className }: MessageCardProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start",
        className
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl p-4 shadow-glass backdrop-blur-md transition-transform hover:-translate-y-1",
          isUser 
            ? "bg-primary/20 border border-primary/30 text-primary-foreground rounded-tr-sm" 
            : "bg-white/5 border border-white/10 text-foreground rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none space-y-2"
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <div className="rounded-lg overflow-hidden my-2 border border-white/10 shadow-inner">
                    <div className="bg-black/40 px-3 py-1 text-xs text-white/50 border-b border-white/10">
                      {match[1]}
                    </div>
                    <SyntaxHighlighter
                      {...props}
                      children={String(children).replace(/\n$/, '')}
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, background: 'rgba(0,0,0,0.2)', padding: '12px' }}
                    />
                  </div>
                ) : (
                  <code {...props} className="bg-black/30 rounded px-1.5 py-0.5 text-xs font-mono text-primary-foreground">
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}
