import { useTranslations } from '@valguide/core/i18n/mock'
import { Label } from '@valguide/ui/components/label'
import { ToggleGroup, ToggleGroupItem } from '@valguide/ui/components/toggle-group'
import { cn } from '@valguide/ui/lib/utils'
import { type RadiusOption, radiusOptions } from '../types'

export interface RadiusSelectorProps {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

export function RadiusSelector({ value, onValueChange, className }: RadiusSelectorProps) {
  const t = useTranslations('studio.themeCustomizer')

  const getRadiusLabel = (radius: RadiusOption): string => {
    switch (radius) {
      case 0:
        return t('radiusSquare')
      case 0.5:
        return t('radiusDefault')
      case 1.5:
        return t('radiusRounded')
      case 2:
        return t('radiusExtra')
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <Label>{t('radius')}</Label>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(v) => v && onValueChange(Number.parseFloat(v))}
        className="justify-start gap-1 flex-wrap"
      >
        {radiusOptions.map((radius) => (
          <ToggleGroupItem
            key={radius}
            value={String(radius)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            aria-label={getRadiusLabel(radius)}
          >
            <div className="size-4 border-2 border-current" style={{ borderRadius: `${radius * 4}px` }} />
            <span className="text-xs">{getRadiusLabel(radius)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
