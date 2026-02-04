import type { FieldDiff } from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import { cn } from '@valguide/ui/lib/utils'
import type { ReactNode } from 'react'
import { ChangedFieldIndicator } from './changed-field-indicator'
import { InlineDiff } from './inline-diff'

export type DiffAwareFieldProps = {
  fieldDiff?: FieldDiff
  children: ReactNode
  className?: string
}

export function DiffAwareField({ fieldDiff, children, className }: DiffAwareFieldProps) {
  const hasChanged = fieldDiff?.hasChanged ?? false
  const isNew = hasChanged && fieldDiff?.published === null

  return (
    <div className={cn('relative', className)}>
      {children}
      {hasChanged && (
        <ChangedFieldIndicator hasChanged={hasChanged} isNew={isNew} className="absolute -right-1 -top-1" />
      )}
    </div>
  )
}

export type DiffFieldLabelProps = {
  fieldDiff?: FieldDiff
  children: ReactNode
  className?: string
}

export function DiffFieldLabel({ fieldDiff, children, className }: DiffFieldLabelProps) {
  const hasChanged = fieldDiff?.hasChanged ?? false
  const isNew = hasChanged && fieldDiff?.published === null

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {children}
      <ChangedFieldIndicator hasChanged={hasChanged} isNew={isNew} />
    </span>
  )
}

export type DiffTextDisplayProps = {
  fieldDiff?: FieldDiff
  diffEnabled: boolean
  currentValue: string | null
  className?: string
}

export function DiffTextDisplay({ fieldDiff, diffEnabled, currentValue, className }: DiffTextDisplayProps) {
  if (!diffEnabled || !fieldDiff?.hasChanged) {
    return <span className={className}>{currentValue}</span>
  }

  return <InlineDiff oldText={fieldDiff.published} newText={fieldDiff.draft} className={className} />
}
