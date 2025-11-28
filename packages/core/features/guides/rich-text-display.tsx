import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'

export interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  if (!content) return null

  const html = generateHTMLFromContent(content)

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by TipTap
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function generateHTMLFromContent(content: string): string {
  if (!content) return ''

  try {
    const json = JSON.parse(content)
    return generateHTML(json, [StarterKit])
  } catch {
    return `<p>${content}</p>`
  }
}
