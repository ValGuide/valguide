import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@valguide/ui/components/collapsible'
import { cn } from '@valguide/ui/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { ThemeColors } from '../types'
import { colorVariableLabels } from '../types'
import { ColorPicker } from './color-picker'

export interface ColorGroupProps {
  title: string
  colorKeys: (keyof ThemeColors)[]
  colors: ThemeColors
  onColorChange: (key: keyof ThemeColors, value: string) => void
  defaultOpen?: boolean
  showTitle?: boolean
  className?: string
}

export function ColorGroup({
  title,
  colorKeys,
  colors,
  onColorChange,
  defaultOpen = false,
  showTitle = true,
  className,
}: ColorGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn('space-y-2', className)}>
      {showTitle ? (
        <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-medium hover:underline">
          {title}
          <ChevronDown className={cn('size-4 transition-transform', isOpen && 'rotate-180')} />
        </CollapsibleTrigger>
      ) : null}
      <CollapsibleContent className="space-y-2">
        <div className={cn('grid grid-cols-1 gap-2', showTitle && 'pt-1')}>
          {colorKeys.map((key) => (
            <ColorPicker
              key={key}
              label={colorVariableLabels[key]}
              value={colors[key]}
              onChange={(value) => onColorChange(key, value)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
