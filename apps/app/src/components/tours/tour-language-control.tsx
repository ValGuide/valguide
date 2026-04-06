import { useRouter } from '@tanstack/react-router'
import { useTourThemePortalContainer } from '@valguide/core/features/player/theming/tour-theme-provider'
import { useTranslations } from '@valguide/core/i18n/client'
import { LocalePickerList } from '@valguide/core/i18n/components/locale-picker-list'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { getLocaleNativeName } from '@valguide/core/i18n/locale-display-names'
import { setLocaleFn } from '@valguide/core/i18n/set-locale.fn'
import { Button } from '@valguide/core/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@valguide/core/ui/components/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@valguide/core/ui/components/sheet'
import { useIsMobile } from '@valguide/core/ui/hooks/use-mobile'
import { ChevronDown, Languages } from 'lucide-react'
import { useEffect, useState } from 'react'

type TourLanguageControlProps = {
  currentLocale: SupportedLocale
  availableLocales: SupportedLocale[]
  preferredSelectionLocale: SupportedLocale
  hasLocaleCookie: boolean
  shouldForceSelection: boolean
  shouldPromptInitialSelection: boolean
}

export function TourLanguageControl({
  currentLocale,
  availableLocales,
  preferredSelectionLocale,
  hasLocaleCookie,
  shouldForceSelection,
  shouldPromptInitialSelection,
}: TourLanguageControlProps) {
  const router = useRouter()
  const t = useTranslations('player.languageSwitcher')
  const portalContainer = useTourThemePortalContainer()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(shouldForceSelection || shouldPromptInitialSelection)
  const [isSwitching, setIsSwitching] = useState(false)
  const [selectedLocale, setSelectedLocale] = useState(preferredSelectionLocale)

  useEffect(() => {
    setSelectedLocale(preferredSelectionLocale)
  }, [preferredSelectionLocale])

  useEffect(() => {
    if (shouldForceSelection || shouldPromptInitialSelection) {
      setOpen(true)
    }
  }, [shouldForceSelection, shouldPromptInitialSelection])

  const requiresSelection = shouldForceSelection || shouldPromptInitialSelection
  const useSheetPicker = isMobile && !requiresSelection
  const currentDisplayLocale = availableLocales.includes(currentLocale) ? currentLocale : preferredSelectionLocale

  async function handleLocaleSelect(nextLocale: SupportedLocale) {
    if (isSwitching) {
      return
    }

    if (nextLocale === currentLocale && !requiresSelection) {
      setOpen(false)
      return
    }

    setIsSwitching(true)
    setSelectedLocale(nextLocale)

    try {
      await setLocaleFn({ data: { locale: nextLocale } })
      if (!requiresSelection) {
        setOpen(false)
      }
      await router.invalidate()
      setIsSwitching(false)
    } catch {
      setSelectedLocale(preferredSelectionLocale)
      setIsSwitching(false)
    }
  }

  const title = shouldForceSelection ? t('unsupportedTitle') : requiresSelection ? t('title') : t('changeTitle')
  const description = shouldForceSelection
    ? t('unsupportedDescription', {
        language: getLocaleNativeName(currentLocale),
      })
    : shouldPromptInitialSelection
      ? hasLocaleCookie
        ? t('changeDescription')
        : t('firstVisitDescription', {
            language: getLocaleNativeName(currentLocale),
          })
      : t('changeDescription')
  const currentLocaleCode = currentDisplayLocale.toUpperCase()
  const trigger = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={isSwitching || availableLocales.length === 0}
      onClick={() => setOpen(true)}
      className="h-9 rounded-full border border-border/70 bg-background/85 px-3 text-xs font-semibold tracking-[0.14em] text-foreground shadow-xs backdrop-blur-sm hover:bg-background"
      aria-label={`${t('buttonLabel')}: ${getLocaleNativeName(currentDisplayLocale)}`}
    >
      <Languages className="h-3.5 w-3.5" />
      <span>{currentLocaleCode}</span>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </Button>
  )

  return (
    <>
      {trigger}

      {useSheetPicker ? (
        <Sheet
          open={open}
          onOpenChange={(nextOpen) => {
            if (!requiresSelection) {
              setOpen(nextOpen)
            }
          }}
        >
          <SheetContent
            side="bottom"
            container={portalContainer}
            onEscapeKeyDown={(event) => {
              if (requiresSelection) {
                event.preventDefault()
              }
            }}
            onPointerDownOutside={(event) => {
              if (requiresSelection) {
                event.preventDefault()
              }
            }}
            className="gap-0 rounded-t-3xl pb-4"
          >
            <SheetHeader className="border-b pb-4 pr-14">
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </SheetHeader>
            <LocalePickerList
              currentLocale={selectedLocale}
              locales={availableLocales}
              disabled={isSwitching}
              onSelectLocale={(locale) => void handleLocaleSelect(locale)}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            if (!requiresSelection) {
              setOpen(nextOpen)
            }
          }}
        >
          <DialogContent
            container={portalContainer}
            showCloseButton={!requiresSelection}
            onEscapeKeyDown={(event) => {
              if (requiresSelection) {
                event.preventDefault()
              }
            }}
            onPointerDownOutside={(event) => {
              if (requiresSelection) {
                event.preventDefault()
              }
            }}
            className="gap-0 overflow-hidden p-0 sm:max-w-md"
          >
            <DialogHeader className="px-4 pt-4 pb-3">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <LocalePickerList
              currentLocale={selectedLocale}
              locales={availableLocales}
              disabled={isSwitching}
              onSelectLocale={(locale) => void handleLocaleSelect(locale)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
