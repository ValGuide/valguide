import { createFileRoute, redirect } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  hideStopFn,
  publishGuideTranslationDraftFn,
  showStopFn,
  unpublishGuideTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideLocaleQueryOptions, guideMetadataQueryOptions } from '@/features/guides/query-options'

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
      const activeLocale = deps.locale ?? defaultLocale
      await context.queryClient.ensureQueryData(guideLocaleQueryOptions(metadata.id, activeLocale))
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
      onHideStop={(guideId, stopId) => hideStopFn({ data: { guideId, stopId } })}
      onShowStop={(guideId, stopId) => showStopFn({ data: { guideId, stopId } })}
      MediaPicker={MediaPickerConnected}
    />
  )
}
