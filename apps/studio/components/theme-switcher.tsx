'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

import { Button } from '@valguide/ui/components/button'

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const t = useTranslations('theme')
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Use resolvedTheme to get the actual theme (light/dark) even when theme is 'system'
    const currentTheme = resolvedTheme || theme
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">{t('toggleTheme')}</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 relative overflow-hidden"
      onClick={toggleTheme}
      aria-label={t('toggleTheme')}
    >
      <Sun
        className="h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out"
        style={{
          transform: isDark ? 'rotate(-90deg) scale(0)' : 'rotate(0deg) scale(1)',
        }}
      />
      <Moon
        className="absolute h-[1.2rem] w-[1.2rem] transition-all duration-500 ease-in-out"
        style={{
          transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
        }}
      />
      <span className="sr-only">{t('toggleTheme')}</span>
    </Button>
  )
}
