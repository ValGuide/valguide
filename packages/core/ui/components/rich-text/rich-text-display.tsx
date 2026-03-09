import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { cn } from '@valguide/ui/lib/utils'
import { SmallText } from './small-text-extension'

export interface RichTextDisplayProps {
  content: string
  className?: string
}

export function RichTextDisplay({ content, className = '' }: RichTextDisplayProps) {
  if (!content) return null

  const html = generateHTMLFromContent(content)

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        'text-foreground',
        'prose-headings:text-foreground prose-strong:text-foreground prose-code:text-foreground',
        'prose-p:text-muted-foreground prose-li:text-muted-foreground prose-blockquote:text-muted-foreground',
        'prose-a:text-foreground prose-a:decoration-border',
        '[&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:max-w-none [&_img]:rounded-md [&_img]:object-contain',
        className,
      )}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is sanitized by TipTap
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function generateHTMLFromContent(content: string): string {
  if (!content) return ''

  try {
    const json = JSON.parse(content)
    return generateHTML(json, [StarterKit, SmallText])
  } catch {
    return `<p>${content}</p>`
  }
}
