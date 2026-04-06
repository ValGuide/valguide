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
import { Languages } from 'lucide-react'
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
  const t = useTranslations('player.languageSwitcher')
  const portalContainer = useTourThemePortalContainer()
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
      window.location.reload()
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

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isSwitching || availableLocales.length === 0}
        onClick={() => setOpen(true)}
        className="w-full justify-center sm:w-auto"
      >
        <Languages className="h-4 w-4" />
        <span>{t('buttonLabel')}</span>
        <span className="text-muted-foreground">{getLocaleNativeName(currentDisplayLocale)}</span>
      </Button>

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
    </>
  )
}
