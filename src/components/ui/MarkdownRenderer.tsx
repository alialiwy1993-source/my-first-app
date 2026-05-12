'use client'

import type { ReactNode } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

/**
 * مكوّن بسيط لعرض Markdown بدون مكتبات خارجية
 * يدعم: headers, bold, code blocks, lists, blockquote, tables
 */
export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let keyCounter = 0
  const key = () => keyCounter++

  while (i < lines.length) {
    const line = lines[i]

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <div key={key()} className="my-3 overflow-hidden rounded-lg border border-slate-700">
          {lang && (
            <div className="flex items-center justify-between bg-slate-800 px-4 py-1.5 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">{lang}</span>
            </div>
          )}
          <pre className="overflow-x-auto bg-slate-900 p-4 text-sm text-slate-300 font-mono leading-relaxed" dir="ltr">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      )
      i++
      continue
    }

    // H1
    if (line.startsWith('# ')) {
      elements.push(<h1 key={key()} className="mt-5 mb-2 text-xl font-bold text-white">{renderInline(line.slice(2))}</h1>)
      i++; continue
    }

    // H2
    if (line.startsWith('## ')) {
      elements.push(<h2 key={key()} className="mt-4 mb-2 text-lg font-bold text-white border-b border-slate-800 pb-1">{renderInline(line.slice(3))}</h2>)
      i++; continue
    }

    // H3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key()} className="mt-3 mb-1.5 text-base font-semibold text-slate-100">{renderInline(line.slice(4))}</h3>)
      i++; continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={key()} className="my-2 border-r-4 border-brand-500 bg-brand-500/5 pr-4 py-2 text-slate-400 italic text-sm">
          {renderInline(line.slice(2))}
        </blockquote>
      )
      i++; continue
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const listItems: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        listItems.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul key={key()} className="my-2 space-y-1 pr-5">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Ordered list
    if (/^\d+\. /.test(line)) {
      const listItems: string[] = []
      let num = 1
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\. /, ''))
        i++; num++
      }
      elements.push(
        <ol key={key()} className="my-2 space-y-1 pr-5 list-decimal list-inside">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-300">
              <span className="text-slate-400 ml-1">{idx + 1}.</span> {renderInline(item)}
            </li>
          ))}
        </ol>
      )
      continue
    }

    // Horizontal rule
    if (line === '---' || line === '***' || line === '___') {
      elements.push(<hr key={key()} className="my-4 border-slate-700" />)
      i++; continue
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<div key={key()} className="h-2" />)
      i++; continue
    }

    // Normal paragraph
    elements.push(
      <p key={key()} className="my-1 text-sm leading-relaxed text-slate-300">
        {renderInline(line)}
      </p>
    )
    i++
  }

  return (
    <div className={`markdown-content prose-rtl ${className}`}>
      {elements}
    </div>
  )
}

/**
 * معالجة inline formatting: **bold**, *italic*, `code`, links
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null

  // تقسيم النص بناءً على الـ patterns
  const parts: React.ReactNode[] = []
  let remaining = text
  let idx = 0

  // regex لكل الـ patterns مجتمعة
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[([^\]]+)\]\(([^)]+)\))/g
  let lastIndex = 0
  let match

  pattern.lastIndex = 0
  while ((match = pattern.exec(text)) !== null) {
    // النص قبل الـ match
    if (match.index > lastIndex) {
      parts.push(<span key={idx++}>{text.slice(lastIndex, match.index)}</span>)
    }

    const m = match[0]
    if (m.startsWith('**')) {
      parts.push(<strong key={idx++} className="font-semibold text-white">{m.slice(2, -2)}</strong>)
    } else if (m.startsWith('*')) {
      parts.push(<em key={idx++} className="italic text-slate-200">{m.slice(1, -1)}</em>)
    } else if (m.startsWith('`')) {
      parts.push(<code key={idx++} className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-xs font-mono text-brand-300">{m.slice(1, -1)}</code>)
    } else if (m.startsWith('[')) {
      parts.push(<a key={idx++} href={match[3]} className="text-brand-400 underline hover:text-brand-300" target="_blank" rel="noopener noreferrer">{match[2]}</a>)
    }

    lastIndex = match.index + m.length
  }

  // بقية النص
  if (lastIndex < text.length) {
    parts.push(<span key={idx++}>{text.slice(lastIndex)}</span>)
  }

  return parts.length > 0 ? <>{parts}</> : text
}
