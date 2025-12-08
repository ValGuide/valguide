'use client'

import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@valguide/ui/components/tabs'
import { cn } from '@valguide/ui/lib/utils'
import type { Theme } from '@valguide/ui/theme/themes'
import { Palette, Smartphone } from 'lucide-react'
import { useMemo } from 'react'
import { useThemeCustomizer } from '../use-theme-customizer'
import { PlayerPreview } from './player-preview'
import { ThemeCustomizerPanel } from './theme-customizer-panel'

export interface ThemeCustomizerProps {
  initialTheme?: Theme
  className?: string
}

export function ThemeCustomizer({ initialTheme = 'light', className }: ThemeCustomizerProps) {
  const customizer = useThemeCustomizer(initialTheme)
  const cssVariables = customizer.getCSSVariables()

  const previewStyle = useMemo(() => cssVariables as React.CSSProperties, [cssVariables])

  return (
    <div className={cn('flex flex-col lg:flex-row gap-6 w-full h-full', className)}>
      {/* Mobile: Tabs layout */}
      <div className="lg:hidden w-full">
        <Tabs defaultValue="customizer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customizer" className="gap-2">
              <Palette className="size-4" />
              Customize
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Smartphone className="size-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="customizer" className="mt-4">
            <ThemeCustomizerPanel customizer={customizer} className="border-0 shadow-none" />
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-1">
                <PlayerPreview style={previewStyle} className="max-w-md mx-auto" />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Side by side layout */}
      <div className="hidden lg:flex lg:flex-row gap-6 w-full flex-1 min-h-0">
        {/* Customizer Panel - Left */}
        <div className="w-[400px] shrink-0">
          <ThemeCustomizerPanel customizer={customizer} />
        </div>

        {/* Preview Panel - Right */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <span className="text-sm text-muted-foreground">
              {customizer.config.theme === 'custom'
                ? 'Custom Theme'
                : `${customizer.config.theme.charAt(0).toUpperCase()}${customizer.config.theme.slice(1).replace('-', ' ')}`}
            </span>
          </div>
          <ScrollArea className="flex-1 rounded-lg border bg-muted/30 p-6">
            <div className="flex justify-center">
              <PlayerPreview style={previewStyle} className="max-w-md w-full shadow-lg" />
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
