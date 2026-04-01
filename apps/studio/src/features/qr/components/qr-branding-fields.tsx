import { Link } from '@tanstack/react-router'
import type {
  EffectiveQrBranding,
  QrBrandingOverride,
  QrBrandingSource,
  QrStylePreset,
} from '@valguide/core/features/links/qr/shared'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { Slider } from '@valguide/ui/components/slider'
import { Switch } from '@valguide/ui/components/switch'

type QrBrandingFieldsProps = {
  source: QrBrandingSource
  override: QrBrandingOverride
  fallbackBranding: EffectiveQrBranding
  inheritedSourceLabel: string
  isSaving: boolean
  onChange: (override: QrBrandingOverride) => void
  onSave: () => void
  onReset: () => void
}

const quietZoneValues = [0, 12, 20] as const

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
  isSaving,
  onChange,
  onSave,
  onReset,
}: QrBrandingFieldsProps) {
  const t = useTranslations('studio.qr')

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
          <Label htmlFor={`qr-background-${source}`}>{t('backgroundColor')}</Label>
          <div className="flex gap-2">
            <Input
              id={`qr-background-${source}`}
              type="color"
              value={override.bgColor ?? fallbackBranding.bgColor}
              onChange={(event) => handleColorChange('bgColor', event.target.value)}
              className="h-10 w-16 p-1"
            />
            <Input
              value={override.bgColor ?? ''}
              placeholder={fallbackBranding.bgColor}
              onChange={(event) => handleColorChange('bgColor', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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

        <div className="space-y-2">
          <Label>{t('quietZone')}</Label>
          <Select
            value={String(override.quietZone ?? fallbackBranding.quietZone)}
            onValueChange={(value) => onChange(updateOverride(override, 'quietZone', Number(value)))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quietZoneValues.map((value) => (
                <SelectItem key={value} value={String(value)}>
                  {t('quietZoneValue', { value })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background p-3">
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('useWorkspaceLogo')}</p>
            <p className="text-sm text-muted-foreground">{t('useWorkspaceLogoDescription')}</p>
          </div>
          <Switch
            checked={override.includeLogo ?? fallbackBranding.includeLogo}
            onCheckedChange={(checked) => onChange(updateOverride(override, 'includeLogo', checked))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <Label>{t('logoSize')}</Label>
            <span className="text-sm text-muted-foreground">
              {Math.round((override.logoSizeRatio ?? fallbackBranding.logoSizeRatio) * 100)}%
            </span>
          </div>
          <Slider
            value={[Math.round((override.logoSizeRatio ?? fallbackBranding.logoSizeRatio) * 100)]}
            min={12}
            max={22}
            step={1}
            onValueChange={(value) =>
              onChange(
                updateOverride(override, 'logoSizeRatio', value[0] ? value[0] / 100 : fallbackBranding.logoSizeRatio),
              )
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? t('saving') : t('saveBranding')}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={isSaving}>
          {source === 'organization' ? t('resetToDefault') : t('resetToInherited')}
        </Button>
      </div>
    </div>
  )
}
