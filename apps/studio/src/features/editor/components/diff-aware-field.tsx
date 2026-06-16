import type { FieldDiff } from '@valguide/core/features/tours/tour/locale/compare-tour-locale-diff.fn'
import { cn } from '@valguide/ui/lib/utils'
import type { ReactNode } from 'react'
import { ChangedFieldIndicator } from './changed-field-indicator'

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
