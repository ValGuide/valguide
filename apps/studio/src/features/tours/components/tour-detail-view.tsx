import { Link } from '@tanstack/react-router'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getTourStatusDisplay } from '@valguide/core/features/tours/status-utils'
import type { TourDetail } from '@valguide/core/features/tours/tour/get-tour-detail.fn'
import { pickBestLocale } from '@valguide/core/features/tours/utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { Image } from '@valguide/ui/components/image'
import { MetadataGrid, MetadataRow } from '@valguide/ui/components/metadata-row'
import { RichTextDisplay } from '@valguide/ui/components/rich-text/rich-text-display'
import { Calendar, ChevronLeft, Clock, ImageIcon, Link2, Pencil } from 'lucide-react'
import { type ComponentType, type ReactNode, useState } from 'react'
import { EditorHeader } from '@/features/editor/components/editor-header'
import { TourStatusBadge } from '@/features/tours/components/tour-status-badge'
import { EditSlugDialog } from './edit-slug-dialog'
import { TranslationsManager } from './translations-manager'

export type TourDetailViewProps = {
  tour: TourDetail
  nanoId: string
  preferredLocale: string
  appDomain: string
  onBack: () => void
  onArchived: () => void
  onAddLanguage: (locale: string) => Promise<void>
  onRemoveLanguage: (locale: string) => Promise<void>
  onPublish?: (locale: string) => Promise<void>
  onUnpublish?: (locale: string) => Promise<void>
  ViewInAppButton: React.ComponentType<{ orgSlug: string; tourSlug: string; published: boolean; appDomain: string }>
  ArchiveTourButton: React.ComponentType<{ tourNanoId: string; onArchived: () => void }>
  SlugSettings?: ComponentType<{ tourNanoId: string; tourTitle: string }>
  orgSlug: string
  currentSlug: string
  headerActions?: ReactNode
}

export function TourDetailView({
  tour,
  nanoId,
  preferredLocale,
  appDomain,
  onBack,
  onArchived,
  onAddLanguage,
  onRemoveLanguage,
  onPublish,
  onUnpublish,
  ViewInAppButton,
  ArchiveTourButton,
  SlugSettings,
  orgSlug,
  currentSlug,
  headerActions,
}: TourDetailViewProps) {
  const t = useTranslations('tours')
  const [slugDialogOpen, setSlugDialogOpen] = useState(false)

  // Compute display values from locales with fallback priority
  const bestLocale = pickBestLocale(preferredLocale, tour.locales)
  const displayTitle = bestLocale?.title?.trim() || t('untitledTour')
  const displayDescription = bestLocale?.description ?? null
  const coverImageUrl = tour.coverImage ? getAssetImageUrl(tour.coverImage) : null

  const { status: tourStatus, indicator } = getTourStatusDisplay(
    { publishedAt: tour.publishedAt, archivedAt: tour.archivedAt },
    tour.hasAnyChanges,
  )

  const actions = headerActions ?? (
    <>
      <ViewInAppButton
        orgSlug={orgSlug}
        tourSlug={currentSlug}
        published={tourStatus === 'published'}
        appDomain={appDomain}
      />
      <ArchiveTourButton tourNanoId={tour.nanoId} onArchived={onArchived} />
      <Button asChild>
        <Link to="/tours/$nanoId/edit" params={{ nanoId }} preload="intent">
          <Pencil className="h-4 w-4" />
          {t('editTour')}
        </Link>
      </Button>
    </>
  )

  return (
    <main className="flex flex-1 flex-col bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 shrink-0">
            <ChevronLeft className="h-4 w-4" />
            <span>{t('title')}</span>
          </Button>
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
        <div className="px-4 pb-3">
          <h1 className="min-w-0 truncate text-lg font-semibold">{displayTitle}</h1>
        </div>
      </div>

      {/* Tablet + Desktop Header */}
      <EditorHeader
        backLabel={t('title')}
        onBack={onBack}
        className="hidden sm:flex"
        actions={<div className="flex items-center gap-2">{actions}</div>}
      />

      {/* Tablet + Desktop: Title */}
      <div className="sticky top-14 z-10 hidden bg-background px-4 py-3 sm:block sm:px-6">
        <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{displayTitle}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 bg-muted/30 dark:bg-background">
        <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6">
          {/* Hero Card with Cover Image */}
          <Card className="overflow-hidden shadow-(--shadow-md)">
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted/30">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={displayTitle}
                  layout="constrained"
                  width={800}
                  height={224}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                    <ImageIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-muted-foreground/70">{t('details.addCoverImageHint')}</p>
                </div>
              )}
            </div>

            {displayDescription && (
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">
                  <RichTextDisplay content={displayDescription} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Details Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">{t('details.title')}</h2>
              <MetadataGrid>
                <MetadataRow
                  label={t('details.tourId')}
                  value={<span className="font-mono text-xs">{tour.nanoId}</span>}
                />
                <MetadataRow
                  label={t('details.created')}
                  value={new Date(tour.createdAt).toLocaleDateString()}
                  icon={<Calendar />}
                />
                <MetadataRow
                  label={t('details.lastUpdated')}
                  value={new Date(tour.updatedAt).toLocaleDateString()}
                  icon={<Clock />}
                />
                <MetadataRow
                  label={t('details.status')}
                  value={<TourStatusBadge status={tourStatus} indicator={indicator} />}
                />
                <MetadataRow
                  label={t('editor.slug.title')}
                  value={
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">{currentSlug}</span>
                      {SlugSettings && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSlugDialogOpen(true)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </span>
                  }
                  icon={<Link2 />}
                />
              </MetadataGrid>
            </CardContent>
          </Card>

          {/* Translations Management */}
          <TranslationsManager
            tourNanoId={nanoId}
            locales={tour.locales}
            onAddLanguage={onAddLanguage}
            onRemoveLanguage={onRemoveLanguage}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
        </div>
      </div>

      {SlugSettings && (
        <EditSlugDialog
          open={slugDialogOpen}
          onOpenChange={setSlugDialogOpen}
          tourNanoId={nanoId}
          tourTitle={displayTitle}
          SlugSettings={SlugSettings}
        />
      )}
    </main>
  )
}
