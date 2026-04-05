import { Link } from '@tanstack/react-router'
import {
  DEFAULT_QR_BRANDING,
  type EffectiveQrBranding,
  type QrBrandingOverride,
  type QrBrandingSource,
  type QrStylePreset,
} from '@valguide/core/features/links/qr/shared'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Switch } from '@valguide/ui/components/switch'

type QrBrandingFieldsProps = {
  source: QrBrandingSource
  override: QrBrandingOverride
  fallbackBranding: EffectiveQrBranding
  inheritedSourceLabel: string
  onChange: (override: QrBrandingOverride) => void
}

function updateOverride(
  current: QrBrandingOverride,
  key: keyof QrBrandingOverride,
  value: QrBrandingOverride[keyof QrBrandingOverride],
): QrBrandingOverride {
  if (value === undefined) {
    const { [key]: _removed, ...rest } = current
    return rest
  }

  return {
    ...current,
    [key]: value,
  }
}

export function QrBrandingFields({
  source,
  override,
  fallbackBranding,
  inheritedSourceLabel,
  onChange,
}: QrBrandingFieldsProps) {
  const t = useTranslations('studio.qr')
  const backgroundValue = override.bgColor ?? fallbackBranding.bgColor
  const isTransparentBackground = backgroundValue === 'transparent'
  const backgroundHexValue = isTransparentBackground ? DEFAULT_QR_BRANDING.bgColor : backgroundValue

  const handleColorChange = (key: 'fgColor' | 'bgColor', value: string) => {
    if (!value.trim()) {
      onChange(updateOverride(override, key, undefined))
      return
    }

    onChange(updateOverride(override, key, value.toUpperCase()))
  }

  const handleStyleChange = (stylePreset: QrStylePreset) => {
    onChange(updateOverride(override, 'stylePreset', stylePreset))
  }

  const handleBackgroundTransparencyChange = (transparent: boolean) => {
    if (transparent) {
      onChange(updateOverride(override, 'bgColor', 'transparent'))
      return
    }

    onChange(updateOverride(override, 'bgColor', backgroundHexValue))
  }

  return (
    <div className="space-y-5 rounded-xl border bg-muted/20 p-3 sm:space-y-6 sm:p-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {source === 'organization'
            ? t('orgBrandingDescription')
            : t('scopeBrandingDescription', { source: inheritedSourceLabel })}
        </p>
        {source !== 'organization' && (
          <Link
            to="/brand/qr"
            className="inline-flex text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t('openBrandKit')}
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <Label htmlFor={`qr-foreground-${source}`}>{t('foregroundColor')}</Label>
          <div className="flex min-w-0 flex-col gap-2 min-[360px]:flex-row">
            <Input
              id={`qr-foreground-${source}`}
              type="color"
              value={override.fgColor ?? fallbackBranding.fgColor}
              onChange={(event) => handleColorChange('fgColor', event.target.value)}
              className="h-10 w-full min-[360px]:w-16 min-[360px]:shrink-0 p-1"
            />
            <Input
              value={override.fgColor ?? ''}
              placeholder={fallbackBranding.fgColor}
              onChange={(event) => handleColorChange('fgColor', event.target.value)}
              className="min-w-0 flex-1"
            />
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
            <Label htmlFor={`qr-background-transparent-${source}`} className="min-w-0">
              {t('backgroundColor')}
            </Label>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 min-[420px]:justify-start min-[420px]:border-0 min-[420px]:bg-transparent min-[420px]:px-0 min-[420px]:py-0">
              <Label htmlFor={`qr-background-transparent-${source}`} className="text-sm text-muted-foreground">
                {t('backgroundTransparent')}
              </Label>
              <Switch
                id={`qr-background-transparent-${source}`}
                checked={isTransparentBackground}
                onCheckedChange={handleBackgroundTransparencyChange}
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2 min-[360px]:flex-row">
            <Input
              id={`qr-background-${source}`}
              type="color"
              value={backgroundHexValue}
              onChange={(event) => handleColorChange('bgColor', event.target.value)}
              className="h-10 w-full min-[360px]:w-16 min-[360px]:shrink-0 p-1"
              disabled={isTransparentBackground}
            />
            <Input
              value={isTransparentBackground ? '' : (override.bgColor ?? '')}
              placeholder={backgroundHexValue}
              onChange={(event) => handleColorChange('bgColor', event.target.value)}
              disabled={isTransparentBackground}
              className={isTransparentBackground ? 'min-w-0 flex-1 opacity-60' : 'min-w-0 flex-1'}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <Label>{t('stylePreset')}</Label>
          <Select
            value={override.stylePreset ?? fallbackBranding.stylePreset}
            onValueChange={(value) => handleStyleChange(value as QrStylePreset)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">{t('styleRounded')}</SelectItem>
              <SelectItem value="soft">{t('styleSoft')}</SelectItem>
              <SelectItem value="square">{t('styleSquare')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

type QrBrandingActionsProps = {
  source: QrBrandingSource
  isSaving: boolean
  onSave: () => void
  onReset: () => void
}

export function QrBrandingActions({ source, isSaving, onSave, onReset }: QrBrandingActionsProps) {
  const t = useTranslations('studio.qr')

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onReset} disabled={isSaving}>
        {source === 'organization' ? t('resetToDefault') : t('resetToInherited')}
      </Button>
      <Button onClick={onSave} disabled={isSaving}>
        {isSaving ? t('saving') : t('saveBranding')}
      </Button>
    </div>
  )
}
