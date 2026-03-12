import { Link } from '@tanstack/react-router'
import type { LocaleDraftInfo } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { useTranslations } from '@valguide/core/i18n/client'
import { getLocaleDisplayName } from '@valguide/core/i18n/locale-display-names'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@valguide/ui/components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@valguide/ui/components/dropdown-menu'

import { Download, MoreHorizontal, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import { useState } from 'react'
import { PublishConfirmationDialog } from '../../editor/components/publish-confirmation-dialog'
import { UnpublishConfirmationDialog } from '../../editor/components/unpublish-confirmation-dialog'
import { AddLanguageDialog } from './add-language-dialog'
import { RemoveLanguageDialog } from './remove-language-dialog'
import { TourStatusBadge } from './tour-status-badge'

export type TranslationsManagerProps = {
  tourNanoId: string
  locales: LocaleDraftInfo[]
  onAddLanguage: (locale: string) => Promise<void>
  onRemoveLanguage: (locale: string) => Promise<void>
  onPublish?: (locale: string) => Promise<void>
  onUnpublish?: (locale: string) => Promise<void>
}

export function TranslationsManager({
  tourNanoId,
  locales,
  onAddLanguage,
  onRemoveLanguage,
  onPublish,
  onUnpublish,
}: TranslationsManagerProps) {
  const t = useTranslations('tours.localesManager')
  const tDetails = useTranslations('tours.details')
  const tStops = useTranslations('stops')
  const tActions = useTranslations('tours.actions')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [localeToRemove, setLocaleToRemove] = useState<string | null>(null)
  const [localeToPublish, setLocaleToPublish] = useState<string | null>(null)
  const [localeToUnpublish, setLocaleToUnpublish] = useState<string | null>(null)
  const [publishingLocale, setPublishingLocale] = useState<string | null>(null)
  const [unpublishingLocale, setUnpublishingLocale] = useState<string | null>(null)

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

  const handleUnpublishClick = (locale: string) => {
    if (!onUnpublish) return
    setLocaleToUnpublish(locale)
  }

  const handleConfirmUnpublish = async () => {
    if (!localeToUnpublish || !onUnpublish) return
    setUnpublishingLocale(localeToUnpublish)
    try {
      await onUnpublish(localeToUnpublish)
    } finally {
      setUnpublishingLocale(null)
      setLocaleToUnpublish(null)
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
              const isCurrentlyPublishing = publishingLocale === localeInfo.locale
              const isCurrentlyUnpublishing = unpublishingLocale === localeInfo.locale
              const showUnpublish = localeInfo.hasPublished && !localeInfo.hasChanges && onUnpublish
              return (
                <div
                  key={localeInfo.locale}
                  className="flex items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-medium">{localeName}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">({localeInfo.locale})</span>
                    <TourStatusBadge
                      status={localeInfo.hasPublished ? 'published' : 'unpublished'}
                      indicator={localeInfo.hasPublished && localeInfo.hasChanges ? 'changed' : null}
                      size="sm"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {showUnpublish ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnpublishClick(localeInfo.locale)}
                        disabled={isCurrentlyUnpublishing}
                      >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {isCurrentlyUnpublishing ? tActions('unpublishing') : tActions('unpublish')}
                        </span>
                        <span className="sr-only sm:hidden">
                          {isCurrentlyUnpublishing ? tActions('unpublishing') : tActions('unpublish')}
                        </span>
                      </Button>
                    ) : onPublish ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePublishClick(localeInfo.locale)}
                        disabled={isCurrentlyPublishing}
                      >
                        <Upload className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {isCurrentlyPublishing ? tActions('publishing') : tActions('publish')}
                        </span>
                        <span className="sr-only sm:hidden">
                          {isCurrentlyPublishing ? tActions('publishing') : tActions('publish')}
                        </span>
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" asChild>
                      <Link
                        to="/tours/$nanoId/edit"
                        params={{ nanoId: tourNanoId }}
                        search={{
                          locale: localeInfo.locale,
                        }}
                        preload="intent"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="hidden sm:inline">{tStops('edit')}</span>
                        <span className="sr-only sm:hidden">{tStops('edit')}</span>
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

      <UnpublishConfirmationDialog
        open={!!localeToUnpublish}
        onOpenChange={(open) => !open && setLocaleToUnpublish(null)}
        languageName={localeToUnpublish ? getLocaleDisplayName(localeToUnpublish) : ''}
        isUnpublishing={!!unpublishingLocale}
        onConfirm={handleConfirmUnpublish}
      />
    </>
  )
}
