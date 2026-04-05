import { useTheme } from '@valguide/core/features/app-theme/theme-provider'
import type { Theme } from '@valguide/core/features/app-theme/types'
import { useTranslations } from '@valguide/core/i18n/client'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@valguide/ui/components/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@valguide/ui/components/drawer'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { useRef } from 'react'

const themeOptions: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

interface ThemeSwitcherDropdownProps {
  isMobile: boolean
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function ThemeSwitcherDropdown({ isMobile, onOpenChange, open }: ThemeSwitcherDropdownProps) {
  const { theme, setTheme } = useTheme()
  // i18n-used-keys: theme.light, theme.dark, theme.system
  const t = useTranslations('theme')
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])

  const handleThemeChange = (newTheme: Theme) => {
    onOpenChange(false)
    if (newTheme === theme) return
    void setTheme(newTheme)
  }

  const focusItem = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, themeOptions.length - 1))
    itemRefs.current[clampedIndex]?.focus()
  }

  const handleItemKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      focusItem(index + 1)
      return
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      focusItem(index - 1)
      return
    }

    if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
      return
    }

    if (event.key === 'End') {
      event.preventDefault()
      focusItem(themeOptions.length - 1)
    }
  }

  const selectedIndex = themeOptions.findIndex((option) => option.value === theme)

  const title = t('toggleTheme')

  const themeList = (
    <div role="listbox" aria-label={title} className="px-2 pb-3">
      {themeOptions.map(({ value, icon: Icon }, index) => (
        <button
          ref={(node) => {
            itemRefs.current[index] = node
          }}
          type="button"
          key={value}
          role="option"
          aria-selected={value === theme}
          tabIndex={index === (selectedIndex === -1 ? 0 : selectedIndex) ? 0 : -1}
          onClick={() => handleThemeChange(value)}
          onKeyDown={(event) => handleItemKeyDown(event, index)}
          className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2.5 text-left text-sm outline-hidden"
        >
          <Icon className="size-4" />
          <span className="flex-1">{t(value)}</span>
          {theme === value && <Check className="size-4 text-primary" />}
        </button>
      ))}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          </DrawerHeader>
          {themeList}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[380px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
        </DialogHeader>
        {themeList}
      </DialogContent>
    </Dialog>
  )
}
