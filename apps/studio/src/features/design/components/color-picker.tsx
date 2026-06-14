import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { cn } from '@valguide/ui/lib/utils'
import { Pipette } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { HexAlphaColorPicker, HexColorPicker } from 'react-colorful'
import { hexToRgba, hslaToRgba, rgbaToHex, rgbaToHsla } from '../color-converter'

export interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
  allowAlpha?: boolean
}

type ColorFormat = 'HEX' | 'HEXA' | 'RGB' | 'RGBA' | 'HSL' | 'HSLA'

interface ColorValues {
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
  hsla: { h: number; s: number; l: number; a: number }
}

function normalizeColorValue(value: string, allowAlpha: boolean) {
  const upperValue = value.toUpperCase()
  return allowAlpha ? upperValue : upperValue.slice(0, 7)
}

export function ColorPicker({ label, value, onChange, className, allowAlpha = true }: ColorPickerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [colorFormat, setColorFormat] = useState<ColorFormat>(allowAlpha ? 'HEXA' : 'HEX')
  const [hexInputValue, setHexInputValue] = useState(normalizeColorValue(value, allowAlpha))

  const [colorValues, setColorValues] = useState<ColorValues>(() => {
    const normalizedValue = normalizeColorValue(value, allowAlpha)
    const rgba = hexToRgba(normalizedValue)
    const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a)
    return { hex: normalizedValue.slice(0, 7), rgba, hsla }
  })

  const updateColorValues = useCallback(
    (newColor: string) => {
      const normalizedColor = normalizeColorValue(newColor, allowAlpha)
      const rgba = hexToRgba(normalizedColor)
      const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a)
      setColorValues({ hex: normalizedColor.slice(0, 7), rgba, hsla })
      setHexInputValue(normalizedColor)
    },
    [allowAlpha],
  )

  useEffect(() => {
    updateColorValues(value)
  }, [value, updateColorValues])

  const handlePickerChange = useCallback(
    (newColor: string) => {
      const normalizedColor = normalizeColorValue(newColor, allowAlpha)
      updateColorValues(normalizedColor)
      onChange(normalizedColor)
    },
    [allowAlpha, onChange, updateColorValues],
  )

  const handleHexChange = useCallback(
    (inputValue: string) => {
      let formatted = inputValue.toUpperCase()
      if (!formatted.startsWith('#')) {
        formatted = `#${formatted}`
      }
      const maxLength = allowAlpha ? 9 : 7
      if (formatted.length <= maxLength && /^#[0-9A-F]*$/.test(formatted)) {
        setHexInputValue(formatted)
        if (formatted.length === 7 || (allowAlpha && formatted.length === 9)) {
          updateColorValues(formatted)
          onChange(formatted)
        }
      }
    },
    [allowAlpha, onChange, updateColorValues],
  )

  const handleRgbaChange = useCallback(
    (component: 'r' | 'g' | 'b' | 'a', inputValue: string) => {
      const numValue = Number.parseFloat(inputValue) || 0
      const clampedValue =
        component === 'a' ? Math.max(0, Math.min(1, numValue)) : Math.max(0, Math.min(255, Math.floor(numValue)))
      const newRgba = { ...colorValues.rgba, [component]: clampedValue }
      const hex = normalizeColorValue(rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a), allowAlpha)
      const hsla = rgbaToHsla(newRgba.r, newRgba.g, newRgba.b, newRgba.a)
      setColorValues({ hex: hex.slice(0, 7), rgba: newRgba, hsla })
      setHexInputValue(hex)
      onChange(hex)
    },
    [allowAlpha, colorValues.rgba, onChange],
  )

  const handleHslaChange = useCallback(
    (component: 'h' | 's' | 'l' | 'a', inputValue: string) => {
      const numValue = Number.parseFloat(inputValue) || 0
      let clampedValue: number
      if (component === 'a') {
        clampedValue = Math.max(0, Math.min(1, numValue))
      } else if (component === 'h') {
        clampedValue = Math.max(0, Math.min(360, numValue))
      } else {
        clampedValue = Math.max(0, Math.min(100, numValue))
      }
      const newHsla = { ...colorValues.hsla, [component]: clampedValue }
      const rgba = hslaToRgba(newHsla.h, newHsla.s, newHsla.l, newHsla.a)
      const hex = normalizeColorValue(rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a), allowAlpha)
      setColorValues({ hex: hex.slice(0, 7), rgba, hsla: newHsla })
      setHexInputValue(hex)
      onChange(hex)
    },
    [allowAlpha, colorValues.hsla, onChange],
  )

  const handleEyeDropper = useCallback(async () => {
    if (typeof window === 'undefined' || !('EyeDropper' in window)) {
      return
    }
    try {
      // @ts-expect-error EyeDropper API not in TypeScript yet
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      const normalizedColor = normalizeColorValue(result.sRGBHex, allowAlpha)
      updateColorValues(normalizedColor)
      onChange(normalizedColor)
    } catch {
      // User canceled
    }
  }, [allowAlpha, onChange, updateColorValues])

  const isEyeDropperAvailable = typeof window !== 'undefined' && 'EyeDropper' in window

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/35',
        className,
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="size-9 shrink-0 rounded-md border border-input shadow-xs transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: hexInputValue }}
            aria-label={t('colorPicker.pickColor', { label })}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs font-medium">{label}</Label>
              {isEyeDropperAvailable && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleEyeDropper}
                  aria-label={t('colorPicker.eyeDropper')}
                >
                  <Pipette className="size-4" />
                </Button>
              )}
            </div>

            {allowAlpha ? (
              <HexAlphaColorPicker
                color={hexInputValue.length === 9 ? hexInputValue : `${colorValues.hex}FF`}
                onChange={handlePickerChange}
                style={{ width: '100%' }}
              />
            ) : (
              <HexColorPicker color={colorValues.hex} onChange={handlePickerChange} style={{ width: '100%' }} />
            )}

            <div className="flex items-center gap-2">
              <Select value={colorFormat} onValueChange={(v) => setColorFormat(v as ColorFormat)}>
                <SelectTrigger className="h-8 w-[72px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={allowAlpha ? 'HEXA' : 'HEX'}>{allowAlpha ? 'HEXA' : 'HEX'}</SelectItem>
                  <SelectItem value={allowAlpha ? 'RGBA' : 'RGB'}>{allowAlpha ? 'RGBA' : 'RGB'}</SelectItem>
                  <SelectItem value={allowAlpha ? 'HSLA' : 'HSL'}>{allowAlpha ? 'HSLA' : 'HSL'}</SelectItem>
                </SelectContent>
              </Select>

              {(colorFormat === 'HEX' || colorFormat === 'HEXA') && (
                <Input
                  value={hexInputValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder={allowAlpha ? '#000000FF' : '#000000'}
                  maxLength={allowAlpha ? 9 : 7}
                  className="h-8 flex-1 text-xs font-mono"
                  aria-label={t('colorPicker.hexInput', { label })}
                />
              )}

              {(colorFormat === 'RGB' || colorFormat === 'RGBA') && (
                <div className="flex flex-1">
                  <Input
                    value={colorValues.rgba.r}
                    onChange={(e) => handleRgbaChange('r', e.target.value)}
                    className="h-8 w-10 rounded-r-none text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.rgba.g}
                    onChange={(e) => handleRgbaChange('g', e.target.value)}
                    className="h-8 w-10 rounded-none border-x-0 text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.rgba.b}
                    onChange={(e) => handleRgbaChange('b', e.target.value)}
                    className={cn(
                      'h-8 w-10 text-center text-xs px-1',
                      allowAlpha ? 'rounded-none border-r-0' : 'rounded-l-none',
                    )}
                    maxLength={3}
                  />
                  {allowAlpha && (
                    <Input
                      value={colorValues.rgba.a.toFixed(2)}
                      onChange={(e) => handleRgbaChange('a', e.target.value)}
                      className="h-8 w-12 rounded-l-none text-center text-xs px-1"
                      maxLength={4}
                    />
                  )}
                </div>
              )}

              {(colorFormat === 'HSL' || colorFormat === 'HSLA') && (
                <div className="flex flex-1">
                  <Input
                    value={colorValues.hsla.h}
                    onChange={(e) => handleHslaChange('h', e.target.value)}
                    className="h-8 w-10 rounded-r-none text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.hsla.s}
                    onChange={(e) => handleHslaChange('s', e.target.value)}
                    className="h-8 w-10 rounded-none border-x-0 text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.hsla.l}
                    onChange={(e) => handleHslaChange('l', e.target.value)}
                    className={cn(
                      'h-8 w-10 text-center text-xs px-1',
                      allowAlpha ? 'rounded-none border-r-0' : 'rounded-l-none',
                    )}
                    maxLength={3}
                  />
                  {allowAlpha && (
                    <Input
                      value={colorValues.hsla.a.toFixed(2)}
                      onChange={(e) => handleHslaChange('a', e.target.value)}
                      className="h-8 w-12 rounded-l-none text-center text-xs px-1"
                      maxLength={4}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1 min-w-0">
        <span className="block text-xs font-medium leading-tight text-foreground">{label}</span>
        <span className="mt-0.5 block break-all font-mono text-[11px] leading-tight text-muted-foreground">
          {hexInputValue}
        </span>
      </div>
    </div>
  )
}
