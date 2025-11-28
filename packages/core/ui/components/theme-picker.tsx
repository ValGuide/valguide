'use client'

import { Button } from '@valguide/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@valguide/ui/components/command'
import { Popover, PopoverContent, PopoverTrigger } from '@valguide/ui/components/popover'
import type { DataTestIdProps } from '@valguide/ui/lib/types'
import { cn } from '@valguide/ui/lib/utils'
import { themes } from '@valguide/ui/theme/themes'
import { Check, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

export interface ThemePickerProps extends React.HTMLAttributes<HTMLDivElement>, DataTestIdProps {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function ThemePicker({
  className,
  align = 'center',
  side = 'bottom',
  'data-testid': dataTestId,
  ...props
}: ThemePickerProps) {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = React.useState(false)

  // Format theme name for display (e.g., 'blue-dark' -> 'Blue Dark')
  const formatThemeName = (themeName: string) => {
    return themeName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className={cn('flex items-center', className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a theme"
            className="w-[200px] justify-between"
            data-testid={dataTestId}
          >
            {theme ? formatThemeName(theme) : 'Select theme...'}
            <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align={align} side={side}>
          <Command>
            <CommandInput placeholder="Search theme..." />
            <CommandList>
              <CommandEmpty>No theme found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  key="system"
                  value="system"
                  onSelect={() => {
                    setTheme('system')
                    setOpen(false)
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', theme === 'system' ? 'opacity-100' : 'opacity-0')} />
                  System
                </CommandItem>
                {themes.map((themeOption) => (
                  <CommandItem
                    key={themeOption}
                    value={themeOption}
                    onSelect={() => {
                      setTheme(themeOption)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', theme === themeOption ? 'opacity-100' : 'opacity-0')} />
                    {formatThemeName(themeOption)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
