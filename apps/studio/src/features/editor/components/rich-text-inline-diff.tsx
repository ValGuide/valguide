import { cn } from '@valguide/ui/lib/utils'
import { diffWords } from 'diff'
import { type ReactNode, useMemo } from 'react'

type TipTapMark = { type: string }
type TipTapNode = {
  type: string
  attrs?: Record<string, unknown>
  content?: TipTapNode[]
  text?: string
  marks?: TipTapMark[]
}

export type RichTextInlineDiffProps = {
  oldContent: string | null
  newContent: string | null
  className?: string
}

export function RichTextInlineDiff({ oldContent, newContent, className }: RichTextInlineDiffProps) {
  const rendered = useMemo(() => {
    const oldDoc = parseContent(oldContent)
    const newDoc = parseContent(newContent)

    if (!newDoc) return null

    const oldText = extractFlatText(oldDoc)
    const newText = extractFlatText(newDoc)

    if (oldText === newText) {
      return renderTree(newDoc, null)
    }

    const diff = diffWords(oldText, newText)
    const cursor: DiffCursor = { parts: diff, partIndex: 0, charIndex: 0 }
    return renderTree(newDoc, cursor)
  }, [oldContent, newContent])

  return (
    <div
      className={cn(
        'max-w-none text-sm text-foreground [&_blockquote]:text-foreground [&_code]:text-foreground [&_em]:text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:max-w-none [&_img]:rounded-md [&_img]:object-contain [&_li]:text-foreground [&_p]:text-foreground [&_pre]:text-foreground [&_small]:text-foreground [&_strong]:text-foreground',
        className,
      )}
    >
      {rendered}
    </div>
  )
}

function parseContent(value: string | null): TipTapNode | null {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: value }] }] }
  }
}

function extractFlatText(node: TipTapNode | null): string {
  if (!node) return ''
  if (node.text) return node.text
  if (!node.content) return ''
  return node.content.map(extractFlatText).join('')
}

type DiffCursor = {
  parts: { value: string; added?: boolean; removed?: boolean }[]
  partIndex: number
  charIndex: number
}

const REMOVED_CLASS =
  'rounded-sm bg-destructive/18 px-0.5 text-foreground line-through decoration-destructive/80 decoration-2 ring-1 ring-inset ring-destructive/25'
const ADDED_CLASS = 'rounded-sm bg-success/18 px-0.5 text-foreground ring-1 ring-inset ring-success/25'

function consumeChars(cursor: DiffCursor, length: number): ReactNode[] {
  const fragments: ReactNode[] = []
  let remaining = length

  while (remaining > 0 && cursor.partIndex < cursor.parts.length) {
    const part = cursor.parts[cursor.partIndex]

    if (part.removed) {
      fragments.push(
        <span key={`r-${cursor.partIndex}`} className={REMOVED_CLASS}>
          {part.value}
        </span>,
      )
      cursor.partIndex++
      cursor.charIndex = 0
      continue
    }

    const available = part.value.length - cursor.charIndex
    const take = Math.min(remaining, available)
    const text = part.value.slice(cursor.charIndex, cursor.charIndex + take)

    if (part.added) {
      fragments.push(
        <span key={`a-${cursor.partIndex}-${cursor.charIndex}`} className={ADDED_CLASS}>
          {text}
        </span>,
      )
    } else {
      fragments.push(text)
    }

    cursor.charIndex += take
    remaining -= take

    if (cursor.charIndex >= part.value.length) {
      cursor.partIndex++
      cursor.charIndex = 0
    }
  }

  return fragments
}

function drainTrailingRemoved(cursor: DiffCursor): ReactNode[] {
  const fragments: ReactNode[] = []
  while (cursor.partIndex < cursor.parts.length && cursor.parts[cursor.partIndex].removed) {
    const part = cursor.parts[cursor.partIndex]
    fragments.push(
      <span key={`r-${cursor.partIndex}`} className={REMOVED_CLASS}>
        {part.value}
      </span>,
    )
    cursor.partIndex++
    cursor.charIndex = 0
  }
  return fragments
}

function renderTree(node: TipTapNode, cursor: DiffCursor | null, key?: string): ReactNode {
  if (node.type === 'text') {
    const text = node.text ?? ''
    if (!cursor) return wrapWithMarks([text], node.marks)
    const fragments = consumeChars(cursor, text.length)
    return <span key={key}>{wrapWithMarks(fragments, node.marks)}</span>
  }

  const children: ReactNode[] = []
  if (node.content) {
    for (let i = 0; i < node.content.length; i++) {
      children.push(renderTree(node.content[i], cursor, `${key ?? 'n'}-${i}`))
    }
  }

  const isEmpty = !node.content || node.content.length === 0

  switch (node.type) {
    case 'doc': {
      const trailing = cursor ? drainTrailingRemoved(cursor) : []
      return (
        <>
          {children}
          {trailing}
        </>
      )
    }
    case 'paragraph':
      return <p key={key}>{isEmpty ? <br /> : children}</p>
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
      return <Tag key={key}>{isEmpty ? <br /> : children}</Tag>
    }
    case 'bulletList':
      return <ul key={key}>{children}</ul>
    case 'orderedList':
      return <ol key={key}>{children}</ol>
    case 'listItem':
      return <li key={key}>{children}</li>
    case 'blockquote':
      return <blockquote key={key}>{children}</blockquote>
    case 'codeBlock':
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      )
    case 'hardBreak':
      return <br key={key} />
    default:
      return <div key={key}>{children}</div>
  }
}

function wrapWithMarks(fragments: ReactNode[], marks?: TipTapMark[]): ReactNode {
  if (!marks || marks.length === 0) return <>{fragments}</>

  let wrapped: ReactNode = <>{fragments}</>
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        wrapped = <strong>{wrapped}</strong>
        break
      case 'italic':
        wrapped = <em>{wrapped}</em>
        break
      case 'strike':
        wrapped = <s>{wrapped}</s>
        break
      case 'code':
        wrapped = <code>{wrapped}</code>
        break
    }
  }
  return wrapped
}
