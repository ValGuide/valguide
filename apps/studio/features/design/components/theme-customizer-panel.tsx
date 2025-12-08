'use client'

import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import { ScrollArea } from '@valguide/ui/components/scroll-area'
import { Separator } from '@valguide/ui/components/separator'
import type { Theme } from '@valguide/ui/theme/themes'
import { RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { backgroundColorKeys, otherColorKeys, primaryColorKeys, type ThemeColors } from '../types'
import type { UseThemeCustomizerReturn } from '../use-theme-customizer'
import { ColorGroup } from './color-group'
import { RadiusSelector } from './radius-selector'
import { ThemeSelector } from './theme-selector'

export interface ThemeCustomizerPanelProps {
  customizer: UseThemeCustomizerReturn
  className?: string
}

export function ThemeCustomizerPanel({ customizer, className }: ThemeCustomizerPanelProps) {
  const t = useTranslations('studio.themeCustomizer')
  const { config, setTheme, setColor, setRadius, resetToTheme } = customizer

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setColor(key, value)
  }

  const handleReset = () => {
    const baseTheme = config.theme === 'custom' ? 'light' : config.theme
    resetToTheme(baseTheme as Theme)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            {t('reset')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)] sm:h-[calc(100vh-12rem)]">
          <div className="space-y-6 px-6 pb-6">
            <ThemeSelector value={config.theme} onValueChange={setTheme} />

            <Separator />

            <RadiusSelector value={config.radius} onValueChange={setRadius} />

            <Separator />

            <div className="space-y-1">
              <ColorGroup
                title={t('primaryColors')}
                colorKeys={primaryColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
                defaultOpen
              />

              <ColorGroup
                title={t('backgroundColors')}
                colorKeys={backgroundColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
              />

              <ColorGroup
                title={t('otherColors')}
                colorKeys={otherColorKeys}
                colors={config.colors}
                onColorChange={handleColorChange}
              />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
