import { Link } from '@tanstack/react-router'
import type { LocaleDraftInfo } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'
import { MoreHorizontal, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { PublishConfirmationDialog } from '../../editor/components/publish-confirmation-dialog'
import { AddLanguageDialog } from './add-language-dialog'
import { RemoveLanguageDialog } from './remove-language-dialog'
import { getLocaleDisplayName } from './unified-locale-selector'

export type TranslationsManagerProps = {
  tourNanoId: string
  locales: LocaleDraftInfo[]
  onAddLanguage: (locale: string) => Promise<void>
  onRemoveLanguage: (locale: string) => Promise<void>
  onPublish?: (locale: string) => Promise<void>
  isPublishing?: boolean
}

export function TranslationsManager({
  tourNanoId,
  locales,
  onAddLanguage,
  onRemoveLanguage,
  onPublish,
  isPublishing,
}: TranslationsManagerProps) {
  const t = useTranslations('tours.localesManager')
  const tDetails = useTranslations('tours.details')
  const tStops = useTranslations('stops')
  const tActions = useTranslations('tours.actions')
  const tLocaleSelector = useTranslations('tours.localeSelector')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)
  const [localeToPublish, setLocaleToPublish] = useState<string | null>(null)
  const [publishingLocale, setPublishingLocale] = useState<string | null>(null)

  const canRemove = locales.length > 1
  const existingLocaleCodes = locales.map((l) => l.locale)

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

  const handlePublishClick = (locale: string) => {
    if (!onPublish) return
    setLocaleToPublish(locale)
  }

  const handleConfirmPublish = async () => {
    if (!localeToPublish || !onPublish) return
    setPublishingLocale(localeToPublish)
    try {
      await onPublish(localeToPublish)
    } finally {
      setPublishingLocale(null)
      setLocaleToPublish(null)
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
            {locales.map((localeInfo) => {
              const localeName = getLocaleDisplayName(localeInfo.locale)
              const isCurrentlyPublishing = publishingLocale === localeInfo.locale || isPublishing
              return (
                <div key={localeInfo.locale} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{localeName}</span>
                    <span className="text-xs text-muted-foreground">({localeInfo.locale})</span>
                    <Badge variant={localeInfo.hasPublished ? 'default' : 'secondary'} className="ml-1">
                      {localeInfo.hasPublished ? tLocaleSelector('statusPublished') : tLocaleSelector('statusDraft')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {onPublish && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublishClick(localeInfo.locale)}
                        disabled={isCurrentlyPublishing}
                      >
                        <Upload className="mr-1 h-4 w-4" />
                        {isCurrentlyPublishing ? tActions('publishing') : tActions('publish')}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/tours/$nanoId/edit"
                        params={{ nanoId: tourNanoId }}
                        search={{
                          locale: localeInfo.locale,
                        }}
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
                          onClick={() => handleRemoveClick(localeInfo.locale)}
                          disabled={!canRemove}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('removeLanguage', {
                            language: localeName,
                          })}
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
        existingLocales={existingLocaleCodes}
        onAddLanguage={onAddLanguage}
      />

      <RemoveLanguageDialog
        open={!!localeToRemove}
        onOpenChange={(open) => !open && setLocaleToRemove(null)}
        locale={localeToRemove}
        onConfirm={handleConfirmRemove}
      />

      <PublishConfirmationDialog
        open={!!localeToPublish}
        onOpenChange={(open) => !open && setLocaleToPublish(null)}
        languageName={localeToPublish ? getLocaleDisplayName(localeToPublish) : ''}
        isPublishing={!!publishingLocale}
        onConfirm={handleConfirmPublish}
      />
    </>
  )
}
