import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/core/ui/components/button'
import { Label } from '@valguide/core/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/core/ui/components/popover'
import { Switch } from '@valguide/core/ui/components/switch'
import { Accessibility, Minus, Plus } from 'lucide-react'
import { type TextSize, useAccessibilitySettings } from './use-accessibility-settings'

type AccessibilityMenuProps = {
  className?: string
}

const TEXT_SIZES: TextSize[] = ['small', 'medium', 'large', 'xlarge']

export function AccessibilityMenu({ className = '' }: AccessibilityMenuProps) {
  const t = useTranslations('player')
  const { highContrast, reducedMotion, textSize, toggleHighContrast, toggleReducedMotion, setTextSize } =
    useAccessibilitySettings()

  const currentSizeIndex = TEXT_SIZES.indexOf(textSize)

  const handleDecreaseSize = () => {
    if (currentSizeIndex > 0) {
      setTextSize(TEXT_SIZES[currentSizeIndex - 1])
    }
  }

  const handleIncreaseSize = () => {
    if (currentSizeIndex < TEXT_SIZES.length - 1) {
      setTextSize(TEXT_SIZES[currentSizeIndex + 1])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label={t('accessibility')}>
          <Accessibility className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h3 className="font-medium text-sm">{t('accessibilitySettings')}</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast" className="text-sm cursor-pointer">
              {t('highContrast')}
            </Label>
            <Switch id="high-contrast" checked={highContrast} onCheckedChange={toggleHighContrast} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="text-sm cursor-pointer">
              {t('reducedMotion')}
            </Label>
            <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={toggleReducedMotion} />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">{t('textSize')}</Label>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecreaseSize}
                disabled={currentSizeIndex === 0}
                aria-label={t('decreaseTextSize')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium flex-1 text-center capitalize">{textSize}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncreaseSize}
                disabled={currentSizeIndex === TEXT_SIZES.length - 1}
                aria-label={t('increaseTextSize')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
