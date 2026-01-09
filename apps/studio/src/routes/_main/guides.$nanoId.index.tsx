import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { Image } from '@unpic/react'
import { clientEnv } from '@valguide/core/env/client'
import { ArchiveGuideButton } from '@valguide/core/features/guides/components/archive-guide-button'
import { ViewInAppButton } from '@valguide/core/features/guides/components/view-in-app-button'
import { RichTextDisplay } from '@valguide/core/features/guides/rich-text-display'
import { useTranslations } from '@valguide/core/i18n/client'
import { Badge } from '@valguide/ui/components/badge'
import { Button } from '@valguide/ui/components/button'
import { Card, CardContent } from '@valguide/ui/components/card'
import { cn } from '@valguide/ui/lib/utils'
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
  const coverImageUrl = guide.assets.find((a) => a.role === 'cover')?.publicUrl

  return (
    <main className="flex flex-1 flex-col bg-gray-50 dark:bg-background">
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
          {/* Hero Card with Cover Image */}
          <Card className="overflow-hidden">
            {/* Cover Image Section */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-muted/40">
              {coverImageUrl ? (
                <Image src={coverImageUrl} alt={title} layout="fullWidth" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 py-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
                    <ImageIcon className="h-10 w-10 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      {t('details.noCoverImage')}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground/70">{t('details.addCoverImageHint')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title and Description */}
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
                  {description && (
                    <div className="text-muted-foreground">
                      <RichTextDisplay content={description} />
                    </div>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 text-xs uppercase tracking-wide',
                    status === 'published' &&
                      'border-emerald-500/50 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
                    status === 'draft' &&
                      'border-slate-400/50 bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
                  )}
                >
                  {t(`details.${status}`)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t('details.title')}</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">{t('details.guideId')}</dt>
                  <dd className="text-sm font-mono">{guide.nanoId}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {t('details.created')}
                  </dt>
                  <dd className="text-sm">{new Date(guide.createdAt).toLocaleDateString()}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {t('details.lastUpdated')}
                  </dt>
                  <dd className="text-sm">{new Date(guide.updatedAt).toLocaleDateString()}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-sm font-medium text-muted-foreground">{t('details.status')}</dt>
                  <dd className="text-sm">{isPublished ? t('details.published') : t('details.draft')}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Translations Card */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">{t('details.translations')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {guide.translations.map((trans) => {
                  const ver = trans.draftVersion ?? trans.currentVersion
                  return (
                    <div
                      key={trans.id}
                      className="rounded-lg border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs font-medium uppercase">
                          {trans.locale}
                        </Badge>
                      </div>
                      <h3 className="font-medium line-clamp-1">{ver?.title ?? t('untitledGuide')}</h3>
                      {ver?.description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
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
