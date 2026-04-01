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

  const handleBackgroundModeChange = (mode: 'transparent' | 'solid') => {
    if (mode === 'transparent') {
      onChange(updateOverride(override, 'bgColor', 'transparent'))
      return
    }

    onChange(updateOverride(override, 'bgColor', backgroundHexValue))
  }

  return (
    <div className="space-y-6 rounded-xl border bg-muted/20 p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">{t('brandingTitle')}</h3>
        <p className="text-sm text-muted-foreground">
          {source === 'organization'
            ? t('orgBrandingDescription')
            : t('scopeBrandingDescription', { source: inheritedSourceLabel })}
        </p>
        {source !== 'organization' && (
          <Link
            to="/design"
            className="inline-flex text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
          >
            {t('openBrandKit')}
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`qr-foreground-${source}`}>{t('foregroundColor')}</Label>
          <div className="flex gap-2">
            <Input
              id={`qr-foreground-${source}`}
              type="color"
              value={override.fgColor ?? fallbackBranding.fgColor}
              onChange={(event) => handleColorChange('fgColor', event.target.value)}
              className="h-10 w-16 p-1"
            />
            <Input
              value={override.fgColor ?? ''}
              placeholder={fallbackBranding.fgColor}
              onChange={(event) => handleColorChange('fgColor', event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('backgroundColor')}</Label>
          <Select
            value={isTransparentBackground ? 'transparent' : 'solid'}
            onValueChange={(value) => handleBackgroundModeChange(value as 'transparent' | 'solid')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transparent">{t('backgroundTransparent')}</SelectItem>
              <SelectItem value="solid">{t('backgroundSolid')}</SelectItem>
            </SelectContent>
          </Select>

          {!isTransparentBackground ? (
            <div className="flex gap-2">
              <Input
                id={`qr-background-${source}`}
                type="color"
                value={backgroundHexValue}
                onChange={(event) => handleColorChange('bgColor', event.target.value)}
                className="h-10 w-16 p-1"
              />
              <Input
                value={override.bgColor ?? ''}
                placeholder={fallbackBranding.bgColor}
                onChange={(event) => handleColorChange('bgColor', event.target.value)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-2">
          <Label>{t('stylePreset')}</Label>
          <Select
            value={override.stylePreset ?? fallbackBranding.stylePreset}
            onValueChange={(value) => handleStyleChange(value as QrStylePreset)}
          >
            <SelectTrigger>
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
