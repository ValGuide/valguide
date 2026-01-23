import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { clientEnv } from '@valguide/core/env/client'
import { ArchiveGuideButton } from '@valguide/core/features/guides/components/archive-guide-button'
import { ViewInAppButton } from '@valguide/core/features/guides/components/view-in-app-button'
import { RichTextDisplay } from '@valguide/core/features/guides/rich-text-display'
import { updateGuideFn } from '@valguide/core/features/guides/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { MetadataGrid, MetadataRow } from '@valguide/ui/components/metadata-row'

import { StatusBadge } from '@valguide/ui/components/status-badge'
import { Calendar, Clock, ImageIcon, Pencil } from 'lucide-react'
import { useCallback } from 'react'
import { EditorHeader } from '@/features/guides/components/editor-header'
import { GuideDetailSkeleton } from '@/features/guides/components/guide-detail-skeleton'
import { TranslationsManager } from '@/features/guides/components/translations-manager'
import { guideDetailQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/$nanoId/')({
  loader: async ({ params, context }) => {
    await context.queryClient.ensureQueryData(guideDetailQueryOptions(params.nanoId, context.locale))
    return { nanoId: params.nanoId, preferredLocale: context.locale }
  },
  component: GuidePage,
  pendingComponent: GuideDetailSkeleton,
})

function GuidePage() {
  const { nanoId, preferredLocale } = Route.useLoaderData()
  const { data: guide } = useQuery(guideDetailQueryOptions(nanoId, preferredLocale))
  const queryClient = useQueryClient()
  const t = useTranslations('guides')
  const tLocales = useTranslations('guides.locales')
  const router = useRouter()
  const handleArchived = async () => {
    await router.invalidate()
    router.navigate({ to: '/' })
  }

  const handleAddLanguage = useCallback(
    async (locale: string) => {
      if (!guide) return
      const newLocales = [...guide.availableLocales, locale]
      try {
        await updateGuideFn({ data: { id: guide.id, availableLocales: newLocales } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
        toast.success(tLocales('updateSuccess'))
      } catch {
        toast.error(tLocales('updateError'))
      }
    },
    [guide, queryClient, nanoId, tLocales],
  )

  const handleRemoveLanguage = useCallback(
    async (locale: string) => {
      if (!guide) return
      const newLocales = guide.availableLocales.filter((l) => l !== locale)
      try {
        await updateGuideFn({ data: { id: guide.id, availableLocales: newLocales } })
        await queryClient.invalidateQueries({ queryKey: ['guide', nanoId] })
        toast.success(tLocales('updateSuccess'))
      } catch {
        toast.error(tLocales('updateError'))
      }
    },
    [guide, queryClient, nanoId, tLocales],
  )

  if (!guide) return null

  const isPublished = !!guide.published
  const status = isPublished ? 'published' : 'draft'

  return (
    <main className="flex flex-1 flex-col bg-background">
      <EditorHeader
        backLabel={t('title')}
        onBack={() => router.navigate({ to: '/' })}
        actions={
          <>
            <ViewInAppButton nanoId={nanoId} published={isPublished} appDomain={clientEnv.VITE_APP_DOMAIN} />
            <ArchiveGuideButton guideId={guide.id} onArchived={handleArchived} />
            <Button asChild>
              <Link to="/guides/$nanoId/edit" params={{ nanoId }} preload="intent">
                <Pencil className="h-4 w-4" />
                {t('editGuide')}
              </Link>
            </Button>
          </>
        }
      />

      {/* Title Row */}
      <div className="sticky top-14 z-10 border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="min-w-0 truncate text-lg font-semibold sm:text-xl">{guide.displayTitle}</h1>
          <StatusBadge status={status} size="lg" className="shrink-0">
            {t(`details.${status}`)}
          </StatusBadge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-muted/30 dark:bg-background">
        <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6">
          {/* Hero Card with Cover Image - Reduced height with gradient overlay */}
          <Card className="overflow-hidden shadow-(--shadow-md)">
            {/* Cover Image Section - Reduced height */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted/30">
              {guide.coverImageUrl ? (
                <Image
                  src={guide.coverImageUrl}
                  alt={guide.displayTitle}
                  layout="fullWidth"
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

            {/* Description */}
            {guide.displayDescription && (
              <CardContent className="p-6">
                <div className="text-sm text-muted-foreground">
                  <RichTextDisplay content={guide.displayDescription} />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Details Card - Using MetadataGrid */}
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
                  value={isPublished ? t('details.published') : t('details.draft')}
                />
              </MetadataGrid>
            </CardContent>
          </Card>

          {/* Translations Management */}
          <TranslationsManager
            guideNanoId={nanoId}
            locales={guide.availableLocales}
            onAddLanguage={handleAddLanguage}
            onRemoveLanguage={handleRemoveLanguage}
          />
        </div>
      </div>
    </main>
  )
}
