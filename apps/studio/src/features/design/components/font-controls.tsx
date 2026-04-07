import { normalizeThemeFonts } from '@valguide/core/features/themes/fonts'
import type { ThemeFonts } from '@valguide/core/features/themes/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { cn } from '@valguide/ui/lib/utils'
import { FontPicker } from './font-picker'

export interface FontControlsProps {
  fonts: ThemeFonts
  onChange: (fonts: ThemeFonts) => void
  className?: string
}

export function FontControls({ fonts, onChange, className }: FontControlsProps) {
  const t = useTranslations('studio.themeCustomizer')
  const normalizedFonts = normalizeThemeFonts(fonts)

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-1.5">
        <FontPicker
          label={t('fonts.primaryLabel')}
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
        <p className="text-xs text-muted-foreground">{t('fonts.primaryHint')}</p>
      </div>
    </div>
  )
}
