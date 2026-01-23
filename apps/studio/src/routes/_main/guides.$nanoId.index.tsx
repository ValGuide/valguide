import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { clientEnv } from '@valguide/core/env/client'
import { ArchiveGuideButton } from '@valguide/core/features/guides/components/archive-guide-button'
import { ViewInAppButton } from '@valguide/core/features/guides/components/view-in-app-button'
import { updateGuideFn } from '@valguide/core/features/guides/server-functions'
import { useTranslations } from '@valguide/core/i18n/client'
import { toast } from '@valguide/core/ui/components/sonner/state'
import { useCallback } from 'react'
import { GuideDetailSkeleton } from '@/features/guides/components/guide-detail-skeleton'
import { GuideDetailView } from '@/features/guides/components/guide-detail-view'
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

  return (
    <GuideDetailView
      guide={guide}
      nanoId={nanoId}
      appDomain={clientEnv.VITE_APP_DOMAIN}
      onBack={() => router.navigate({ to: '/' })}
      onArchived={handleArchived}
      onAddLanguage={handleAddLanguage}
      onRemoveLanguage={handleRemoveLanguage}
      ViewInAppButton={ViewInAppButton}
      ArchiveGuideButton={ArchiveGuideButton}
    />
  )
}
