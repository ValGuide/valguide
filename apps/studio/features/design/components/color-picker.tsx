'use client'

import { Input } from '@valguide/ui/components/input'
import { Label } from '@valguide/ui/components/label'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import { cn } from '@valguide/ui/lib/utils'
import { useCallback, useEffect, useState } from 'react'

export interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        onChange(newValue)
      }
    },
    [onChange],
  )

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      onChange(newValue)
    },
    [onChange],
  )

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="size-8 rounded-md border border-input shadow-xs shrink-0 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ backgroundColor: value }}
            aria-label={`Pick color for ${label}`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="space-y-3">
            <Label className="text-xs">{label}</Label>
            <input
              type="color"
              value={value}
              onChange={handleColorPickerChange}
              className="size-32 cursor-pointer rounded-md border-0 p-0"
            />
            <Input
              value={localValue}
              onChange={handleInputChange}
              placeholder="#000000"
              className="h-8 text-xs font-mono"
            />
          </div>
        </PopoverContent>
      </Popover>
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground truncate block">{label}</span>
      </div>
    </div>
  )
}
