import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@valguide/ui/components/tooltip'
import { GitCompare } from 'lucide-react'

export type DiffToggleProps = {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  changedCount: number
  disabled?: boolean
}

export function DiffToggle({ enabled, onToggle, changedCount, disabled = false }: DiffToggleProps) {
  const t = useTranslations('tours.diff')

  if (changedCount === 0) return null

  const label = t('toggleLabel', { count: changedCount })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={enabled ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToggle(!enabled)}
          disabled={disabled}
          className="gap-1.5"
        >
          <GitCompare className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{changedCount}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs sm:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
