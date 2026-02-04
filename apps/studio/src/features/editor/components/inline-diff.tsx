import { cn } from '@valguide/ui/lib/utils'
import { diffWords } from 'diff'
import { useMemo } from 'react'

export type InlineDiffProps = {
  oldText: string | null
  newText: string | null
  className?: string
}

export function InlineDiff({ oldText, newText, className }: InlineDiffProps) {
  const diffResult = useMemo(() => {
    const oldValue = oldText ?? ''
    const newValue = newText ?? ''

    if (oldValue === newValue) return null

    return diffWords(oldValue, newValue)
  }, [oldText, newText])

  if (!diffResult) {
    return <span className={className}>{newText}</span>
  }

  return (
    <span className={cn('inline', className)}>
      {diffResult.map((part) => {
        const key = `${part.added ? 'a' : part.removed ? 'r' : 'u'}-${part.value.slice(0, 20)}`
        if (part.added) {
          return (
            <span key={key} className="rounded-sm bg-success/20 px-0.5 text-success dark:bg-success/30">
              {part.value}
            </span>
          )
        }
        if (part.removed) {
          return (
            <span
              key={key}
              className="rounded-sm bg-destructive/20 px-0.5 text-destructive line-through dark:bg-destructive/30"
            >
              {part.value}
            </span>
          )
        }
        return <span key={key}>{part.value}</span>
      })}
    </span>
  )
}
