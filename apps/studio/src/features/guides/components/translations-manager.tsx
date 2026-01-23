import { Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { AddLanguageDialog } from './add-language-dialog'
import { RemoveLanguageDialog } from './remove-language-dialog'
import { getLocaleDisplayName } from './unified-locale-selector'

export type TranslationsManagerProps = {
  guideNanoId: string
  locales: string[]
  onAddLanguage: (locale: string) => Promise<void>
  onRemoveLanguage: (locale: string) => Promise<void>
}

export function TranslationsManager({
  guideNanoId,
  locales,
  onAddLanguage,
  onRemoveLanguage,
}: TranslationsManagerProps) {
  const t = useTranslations('guides.localesManager')
  const tDetails = useTranslations('guides.details')
  const tStops = useTranslations('stops')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)

  const canRemove = locales.length > 1

  const handleRemoveClick = (locale: string) => {
    if (!canRemove) return
    setLocaleToRemove(locale)
  }

  const handleConfirmRemove = async () => {
    if (localeToRemove) {
      await onRemoveLanguage(localeToRemove)
      setLocaleToRemove(null)
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">{tDetails('translations')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-1 h-4 w-4" />
            {t('addLanguage')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {locales.map((locale) => {
              const localeName = getLocaleDisplayName(locale)
              return (
                <div key={locale} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{localeName}</span>
                    <span className="text-xs text-muted-foreground">({locale})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/guides/$nanoId/edit"
                        params={{ nanoId: guideNanoId }}
                        search={{ locale }}
                        preload="intent"
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        {tStops('edit')}
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveClick(locale)}
                          disabled={!canRemove}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('removeLanguage', { language: localeName })}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <AddLanguageDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        existingLocales={locales}
        onAddLanguage={onAddLanguage}
      />

      <RemoveLanguageDialog
        open={!!localeToRemove}
        onOpenChange={(open) => !open && setLocaleToRemove(null)}
        locale={localeToRemove}
        onConfirm={handleConfirmRemove}
      />
    </>
  )
}
