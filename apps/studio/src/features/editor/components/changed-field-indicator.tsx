import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { cn } from '@valguide/ui/lib/utils'

export type ChangedFieldIndicatorProps = {
  hasChanged: boolean
  isNew?: boolean
  className?: string
}

export function ChangedFieldIndicator({ hasChanged, isNew = false, className }: ChangedFieldIndicatorProps) {
  if (!hasChanged) return null

  const label = isNew ? 'New field' : 'Changed since last publish'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn('inline-flex h-2 w-2 shrink-0 rounded-full', isNew ? 'bg-success' : 'bg-amber-500', className)}
          aria-label={label}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
