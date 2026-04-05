import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@valguide/ui/components/select'
import { cn } from '@valguide/ui/lib/utils'
import { Pipette } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { HexAlphaColorPicker } from 'react-colorful'
import { hexToRgba, hslaToRgba, rgbaToHex, rgbaToHsla } from '../color-converter'

export interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

type ColorFormat = 'HEXA' | 'RGBA' | 'HSLA'

interface ColorValues {
  hex: string
  rgba: { r: number; g: number; b: number; a: number }
  hsla: { h: number; s: number; l: number; a: number }
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const t = useTranslations('studio.themeCustomizer')
  const [colorFormat, setColorFormat] = useState<ColorFormat>('HEXA')
  const [hexInputValue, setHexInputValue] = useState(value.toUpperCase())

  const [colorValues, setColorValues] = useState<ColorValues>(() => {
    const rgba = hexToRgba(value)
    const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a)
    return { hex: value, rgba, hsla }
  })

  const updateColorValues = useCallback((newColor: string) => {
    const rgba = hexToRgba(newColor)
    const hsla = rgbaToHsla(rgba.r, rgba.g, rgba.b, rgba.a)
    setColorValues({ hex: newColor.slice(0, 7), rgba, hsla })
    setHexInputValue(newColor.toUpperCase())
  }, [])

  useEffect(() => {
    updateColorValues(value)
  }, [value, updateColorValues])

  const handlePickerChange = useCallback(
    (newColor: string) => {
      updateColorValues(newColor)
      onChange(newColor)
    },
    [onChange, updateColorValues],
  )

  const handleHexChange = useCallback(
    (inputValue: string) => {
      let formatted = inputValue.toUpperCase()
      if (!formatted.startsWith('#')) {
        formatted = `#${formatted}`
      }
      if (formatted.length <= 9 && /^#[0-9A-F]*$/.test(formatted)) {
        setHexInputValue(formatted)
        if (formatted.length === 7 || formatted.length === 9) {
          updateColorValues(formatted)
          onChange(formatted)
        }
      }
    },
    [onChange, updateColorValues],
  )

  const handleRgbaChange = useCallback(
    (component: 'r' | 'g' | 'b' | 'a', inputValue: string) => {
      const numValue = Number.parseFloat(inputValue) || 0
      const clampedValue =
        component === 'a' ? Math.max(0, Math.min(1, numValue)) : Math.max(0, Math.min(255, Math.floor(numValue)))
      const newRgba = { ...colorValues.rgba, [component]: clampedValue }
      const hex = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a)
      const hsla = rgbaToHsla(newRgba.r, newRgba.g, newRgba.b, newRgba.a)
      setColorValues({ hex: hex.slice(0, 7), rgba: newRgba, hsla })
      setHexInputValue(hex)
      onChange(hex)
    },
    [colorValues.rgba, onChange],
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
      const hex = rgbaToHex(rgba.r, rgba.g, rgba.b, rgba.a)
      setColorValues({ hex: hex.slice(0, 7), rgba, hsla: newHsla })
      setHexInputValue(hex)
      onChange(hex)
    },
    [colorValues.hsla, onChange],
  )

  const handleEyeDropper = useCallback(async () => {
    if (typeof window === 'undefined' || !('EyeDropper' in window)) {
      return
    }
    try {
      // @ts-expect-error EyeDropper API not in TypeScript yet
      const eyeDropper = new window.EyeDropper()
      const result = await eyeDropper.open()
      updateColorValues(result.sRGBHex)
      onChange(result.sRGBHex)
    } catch {
      // User canceled
    }
  }, [onChange, updateColorValues])

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

            <HexAlphaColorPicker
              color={hexInputValue.length === 9 ? hexInputValue : `${colorValues.hex}FF`}
              onChange={handlePickerChange}
              style={{ width: '100%' }}
            />

            <div className="flex items-center gap-2">
              <Select value={colorFormat} onValueChange={(v) => setColorFormat(v as ColorFormat)}>
                <SelectTrigger className="h-8 w-[72px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEXA">HEXA</SelectItem>
                  <SelectItem value="RGBA">RGBA</SelectItem>
                  <SelectItem value="HSLA">HSLA</SelectItem>
                </SelectContent>
              </Select>

              {colorFormat === 'HEXA' && (
                <Input
                  value={hexInputValue}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000FF"
                  maxLength={9}
                  className="h-8 flex-1 text-xs font-mono"
                  aria-label={t('colorPicker.hexInput', { label })}
                />
              )}

              {colorFormat === 'RGBA' && (
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
                    className="h-8 w-10 rounded-none border-r-0 text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.rgba.a.toFixed(2)}
                    onChange={(e) => handleRgbaChange('a', e.target.value)}
                    className="h-8 w-12 rounded-l-none text-center text-xs px-1"
                    maxLength={4}
                  />
                </div>
              )}

              {colorFormat === 'HSLA' && (
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
                    className="h-8 w-10 rounded-none border-r-0 text-center text-xs px-1"
                    maxLength={3}
                  />
                  <Input
                    value={colorValues.hsla.a.toFixed(2)}
                    onChange={(e) => handleHslaChange('a', e.target.value)}
                    className="h-8 w-12 rounded-l-none text-center text-xs px-1"
                    maxLength={4}
                  />
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
