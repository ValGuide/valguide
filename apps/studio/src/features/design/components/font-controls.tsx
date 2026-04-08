import { normalizeThemeFonts } from '@valguide/core/features/themes/fonts'
import type { ThemeFonts } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { FontPicker } from './font-picker'

export interface FontControlsProps {
  fonts: ThemeFonts
  onChange: (fonts: ThemeFonts) => void
  label?: string
  showLabel?: boolean
  showHint?: boolean
  className?: string
}

export function FontControls({
  fonts,
  onChange,
  label,
  showLabel = true,
  showHint = true,
  className,
}: FontControlsProps) {
  const t = useTranslations('studio.themeCustomizer')
  const normalizedFonts = normalizeThemeFonts(fonts)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1.5">
        <FontPicker
          label={label ?? t('fonts.primaryLabel')}
          showLabel={showLabel}
          value={normalizedFonts.primary}
          onValueChange={(font) => {
            if (!font) {
              return
            }
            onChange({
              primary: font,
            })
          }}
        />
        {showHint ? <p className="text-xs text-muted-foreground">{t('fonts.primaryHint')}</p> : null}
      </div>
    </div>
  )
}
