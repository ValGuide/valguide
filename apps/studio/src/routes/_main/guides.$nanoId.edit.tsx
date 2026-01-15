import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  publishGuideTranslationDraftFn,
  unpublishGuideTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideMetadataQueryOptions } from '@/features/guides/query-options'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/edit')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    stop: search.stop as string | undefined,
    locale: search.locale as string | undefined,
  }),
  loader: async ({ params, context }) => {
    // Only load metadata (no translations) - much lighter!
    const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))

    if (!metadata) {
      throw new Error('Guide not found')
    }

    return { nanoId: params.nanoId }
  },
  component: GuideEditPage,
  pendingComponent: GuideEditSkeleton,
})

function GuideEditPage() {
  const { nanoId } = Route.useLoaderData()
  const { stop: stopId, locale: editorLocale } = Route.useSearch()

  if (stopId) {
    throw redirect({
      to: '/guides/$nanoId/stops/$stopId/edit',
      params: { nanoId, stopId },
    })
  }

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={editorLocale}>
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
      MediaPicker={MediaPickerConnected}
    />
  )
}
