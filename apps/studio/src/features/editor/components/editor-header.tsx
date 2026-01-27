import { Button } from '@valguide/ui/components/button'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'

export type EditorHeaderProps = {
  actions?: ReactNode
  className?: string
} & (
  | { backLabel: string; onBack: () => void; backContent?: never }
  | { backContent: ReactNode; backLabel?: never; onBack?: never }
  | { backContent: ReactNode; backLabel?: string; onBack?: () => void }
)

export function EditorHeader({ backLabel, onBack, backContent, actions, className }: EditorHeaderProps) {
  return (
    <div className={cn('sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 sm:px-6', className)}>
      <div className="flex w-full items-center justify-between gap-2">
        {backContent ?? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ChevronLeft className="h-4 w-4" />
            <span>{backLabel}</span>
          </Button>
        )}
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
