import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { clientEnv } from '@valguide/core/env/client'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { ArchiveGuideButton } from '@valguide/core/features/guides/components/archive-guide-button'
import { ViewInAppButton } from '@valguide/core/features/guides/components/view-in-app-button'
import { RichTextDisplay } from '@valguide/core/features/guides/rich-text-display'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { MetadataGrid, MetadataRow } from '@valguide/ui/components/metadata-row'
import { StatusBadge } from '@valguide/ui/components/status-badge'
import { ArrowLeft, Calendar, Clock, ImageIcon, Pencil } from 'lucide-react'
import { GuideDetailSkeleton } from '@/features/guides/components/guide-detail-skeleton'
import { guideWithAssetsQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/$nanoId/')({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(guideWithAssetsQueryOptions(params.nanoId)),
  component: GuidePage,
  pendingComponent: GuideDetailSkeleton,
})

function GuidePage() {
  const { nanoId } = Route.useParams()
  const { data: guide } = useQuery(guideWithAssetsQueryOptions(nanoId))
  const t = useTranslations('guides')
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleArchived = async () => {
    await queryClient.invalidateQueries({ queryKey: ['guides'] })
    await queryClient.invalidateQueries({ queryKey: ['archived-guides'] })
    router.navigate({ to: '/' })
  }

  if (!guide) return null

  const translation = guide.translations.find((tr) => tr.locale === 'de') ?? guide.translations[0]
  const version = translation?.draftVersion ?? translation?.currentVersion
  const title = version?.title ?? t('untitledGuide')
  const description = version?.description ?? ''
  const isPublished = !!guide.published
  const status = isPublished ? 'published' : 'draft'
  const coverAsset = guide.assets.find((a) => a.role === 'cover')
  const coverImageUrl = coverAsset ? getAssetImageUrl(coverAsset) : null

  return (
    <main className="flex flex-1 flex-col">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{t('backToGuides')}</span>
          </Link>
          <div className="flex gap-2">
            <ViewInAppButton nanoId={nanoId} published={isPublished} appDomain={clientEnv.VITE_APP_DOMAIN} />
            <ArchiveGuideButton guideId={guide.id} onArchived={handleArchived} />
            <Button asChild>
              <Link to="/guides/$nanoId/edit" params={{ nanoId }}>
                <Pencil className="h-4 w-4" />
                {t('editGuide')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6 sm:p-8 space-y-6">
          {/* Hero Card with Cover Image - Reduced height with gradient overlay */}
          <Card className="overflow-hidden shadow-[var(--shadow-md)]">
            {/* Cover Image Section - Reduced height */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-muted/30">
              {coverImageUrl ? (
                <Image src={coverImageUrl} alt={title} layout="fullWidth" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                    <ImageIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-muted-foreground/70">{t('details.addCoverImageHint')}</p>
                </div>
              )}
            </div>

            {/* Title and Description - More compact */}
            <CardContent className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                  {description && (
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      <RichTextDisplay content={description} />
                    </div>
                  )}
                </div>
                <StatusBadge status={status} size="lg" className="shrink-0">
                  {t(`details.${status}`)}
                </StatusBadge>
              </div>
            </CardContent>
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

          {/* Translations Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">{t('details.translations')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guide.translations.map((trans) => {
                  const ver = trans.draftVersion ?? trans.currentVersion
                  return (
                    <div
                      key={trans.id}
                      className="rounded-lg border bg-muted/20 p-4 transition-all duration-200 hover:bg-muted/30 hover:border-primary/20"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-[10px] font-medium uppercase tracking-wider">
                          {trans.locale}
                        </Badge>
                      </div>
                      <h3 className="font-medium line-clamp-1 text-sm">{ver?.title ?? t('untitledGuide')}</h3>
                      {ver?.description && (
                        <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          <RichTextDisplay content={ver.description} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
