import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideLocaleQueryOptions, guideMetadataQueryOptions } from '@/features/guides/query-options'
import { createFileRoute } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  hideStopFn,
  publishGuideTranslationDraftFn,
  showStopFn,
  unpublishGuideTranslationFn,
} from '@valguide/core/features/guides/server-functions'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    stop: search.stop as string | undefined,
    locale: search.locale as string | undefined,
  }),
  loaderDeps: ({ search }) => ({ locale: search.locale }),
  loader: async ({ params, context, deps }) => {
    const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))

    if (metadata) {
      await context.queryClient.ensureQueryData(guideLocaleQueryOptions(metadata.id, deps.locale))
    }

    return { nanoId: params.nanoId }
  },
  component: GuideEditPage,
  pendingComponent: GuideEditSkeleton,
})

function GuideEditPage() {
  const { nanoId } = Route.useLoaderData()
  const { locale } = Route.useSearch()

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={locale}>
      <GuideEditContent />
    </GuideEditorProvider>
  )
}

function GuideEditContent() {
  const { metadata } = useGuideEditor()

  if (!metadata) {
    return <GuideEditSkeleton />
  }

  return (
    <GuideEditView
      onPublish={(guideId, locale) => publishGuideTranslationDraftFn({ data: { guideId, locale } })}
      onUnpublish={(guideId, locale) => unpublishGuideTranslationFn({ data: { guideId, locale } })}
      onDiscard={(guideId, locale) => discardGuideTranslationDraftFn({ data: { guideId, locale } })}
      onHideStop={(guideId, stopId) => hideStopFn({ data: { guideId, stopId } })}
      onShowStop={(guideId, stopId) => showStopFn({ data: { guideId, stopId } })}
      MediaPicker={MediaPickerConnected}
    />
  )
}
