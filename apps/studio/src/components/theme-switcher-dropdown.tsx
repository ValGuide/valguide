import { useTheme } from '@valguide/core/features/app-theme/theme-provider'
import type { Theme } from '@valguide/core/features/app-theme/types'
import { useTranslations } from '@valguide/core/i18n/client'
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { Check, Monitor, Moon, Sun } from 'lucide-react'

const themeOptions: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

export function ThemeSwitcherDropdown() {
  const { theme, setTheme } = useTheme()
  // i18n-used-keys: theme.light, theme.dark, theme.system
  const t = useTranslations('theme')

  const handleThemeChange = (newTheme: Theme) => {
    if (newTheme === theme) return
    setTheme(newTheme)
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="cursor-pointer">
        <Sun className="size-4 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        {t('toggleTheme')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {themeOptions.map(({ value, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => handleThemeChange(value)} className="cursor-pointer">
            <Icon className="size-4" />
            <span className="flex-1">{t(value)}</span>
            {theme === value && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
