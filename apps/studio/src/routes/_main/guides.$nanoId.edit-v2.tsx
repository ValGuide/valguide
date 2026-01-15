import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  discardStopTranslationDraftFn,
  publishGuideTranslationDraftFn,
  publishStopTranslationDraftFn,
  unpublishGuideTranslationFn,
  unpublishStopTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditViewV2 } from '@/features/guides/components/guide-edit-view-v2'
import { StopEditViewV2 } from '@/features/guides/components/stop-edit-view-v2'
import { GuideEditorV2Provider } from '@/features/guides/contexts/guide-editor-v2-context'
import { useGuideEditorV2 } from '@/features/guides/contexts/guide-editor-v2-types'
import { guideMetadataQueryOptions } from '@/features/guides/query-options'

type SearchParams = {
  stop?: string
  locale?: string
}

export const Route = createFileRoute('/_main/guides/$nanoId/edit-v2')({
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
  component: GuideEditPageV2,
  pendingComponent: GuideEditSkeleton,
})

function GuideEditPageV2() {
  const { nanoId } = Route.useLoaderData()
  const { stop: stopId, locale: editorLocale } = Route.useSearch()

  if (stopId) {
    throw redirect({
      to: '/guides/$nanoId/stops/$stopId/edit',
      params: { nanoId, stopId },
    })
  }

  return (
    <GuideEditorV2Provider nanoId={nanoId} initialLocale={editorLocale}>
      <GuideEditContentV2 />
    </GuideEditorV2Provider>
  )
}

function GuideEditContentV2() {
  const { metadata, stops } = useGuideEditorV2()

  if (!metadata) {
    return <GuideEditSkeleton />
  }

  return (
    <GuideEditViewV2
      onPublish={(guideId, locale) => publishGuideTranslationDraftFn({ data: { guideId, locale } })}
      onUnpublish={(guideId, locale) => unpublishGuideTranslationFn({ data: { guideId, locale } })}
      onDiscard={(guideId, locale) => discardGuideTranslationDraftFn({ data: { guideId, locale } })}
      MediaPicker={MediaPickerConnected}
    />
  )
}
