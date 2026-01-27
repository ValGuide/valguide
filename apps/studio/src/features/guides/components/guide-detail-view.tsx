import { Link } from '@tanstack/react-router'
import { GuideStatusBadge } from '@valguide/core/features/guides/components/guide-status-badge'
import { RichTextDisplay } from '@valguide/core/features/guides/components/rich-text-display'
import type { GuideDetail } from '@valguide/core/features/guides/guide/get-guide-detail.fn'
import { getGuideStatus } from '@valguide/core/features/guides/status-utils'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { MetadataGrid, MetadataRow } from '@valguide/ui/components/metadata-row'
import { Calendar, Clock, ImageIcon, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { EditorHeader } from './editor-header'
import { TranslationsManager } from './translations-manager'

export type GuideDetailViewProps = {
  guide: GuideDetail
  nanoId: string
  preferredLocale: string
  appDomain: string
  onBack: () => void
  onArchived: () => void
  onAddLanguage: (locale: string) => Promise<void>
  onRemoveLanguage: (locale: string) => Promise<void>
  ViewInAppButton: React.ComponentType<{ nanoId: string; published: boolean; appDomain: string }>
  ArchiveGuideButton: React.ComponentType<{ guideNanoId: string; onArchived: () => void }>
  headerActions?: ReactNode
}

export function GuideDetailView({
  guide,
  nanoId,
  preferredLocale,
  appDomain,
  onBack,
  onArchived,
  onAddLanguage,
  onRemoveLanguage,
  ViewInAppButton,
  ArchiveGuideButton,
  headerActions,
}: GuideDetailViewProps) {
  const t = useTranslations('guides')

  // Compute display values from locales
  const preferredLocaleData = guide.locales.find((l) => l.locale === preferredLocale) ?? guide.locales[0]
  const displayTitle = preferredLocaleData?.title?.trim() || t('untitledGuide')
  const displayDescription = preferredLocaleData?.description ?? null
  const isPublished = guide.locales.some((l) => l.publishedVersionId !== null)

  const guideStatus = getGuideStatus({
    published: isPublished ? new Date() : null, // getGuideStatus expects Date | null
    archivedAt: guide.archivedAt,
  })

  return (
    <main className="flex flex-1 flex-col bg-background">
      <EditorHeader
        backLabel={t('title')}
        onBack={onBack}
        actions={
          headerActions ?? (
            <>
              <ViewInAppButton nanoId={nanoId} published={guideStatus === 'published'} appDomain={appDomain} />
              <ArchiveGuideButton guideNanoId={guide.nanoId} onArchived={onArchived} />
              <Button asChild>
                <Link to="/guides/$nanoId/edit" params={{ nanoId }} preload="intent">
                  <Pencil className="h-4 w-4" />
                  {t('editGuide')}
                </Link>
              </Button>
            </>
          )
        }
      />

      {/* Title Row */}
      <div className="sticky top-14 z-10 border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{displayTitle}</h1>
          <GuideStatusBadge status={guideStatus} size="lg" className="shrink-0" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-muted/30 dark:bg-background">
        <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6">
          {/* Hero Card with Cover Image placeholder */}
          <Card className="overflow-hidden shadow-(--shadow-md)">
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted/30">
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                  <ImageIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm text-muted-foreground/70">{t('details.addCoverImageHint')}</p>
              </div>
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
                  label={t('details.guideId')}
                  value={<span className="font-mono text-xs">{guide.nanoId}</span>}
                />
                <MetadataRow
                  label={t('details.created')}
                  value={new Date(guide.createdAt).toLocaleDateString()}
                  icon={<Calendar />}
                />
                <MetadataRow
                  label={t('details.lastUpdated')}
                  value={new Date(guide.updatedAt).toLocaleDateString()}
                  icon={<Clock />}
                />
                <MetadataRow
                  label={t('details.status')}
                  value={guideStatus === 'published' ? t('details.published') : t('details.draft')}
                />
              </MetadataGrid>
            </CardContent>
          </Card>

          {/* Translations Management */}
          <TranslationsManager
            guideNanoId={nanoId}
            locales={guide.availableLocales}
            onAddLanguage={onAddLanguage}
            onRemoveLanguage={onRemoveLanguage}
          />
        </div>
      </div>
    </main>
  )
}
