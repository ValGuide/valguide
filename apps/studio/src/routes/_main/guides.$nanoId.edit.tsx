import { createFileRoute } from '@tanstack/react-router'
import {
  discardGuideTranslationDraftFn,
  publishGuideTranslationDraftFn,
  unpublishGuideTranslationFn,
} from '@valguide/core/features/guides/server-functions'
import { defaultLocale } from '@valguide/i18n/i18n.config'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideLocaleQueryOptions, guideMetadataQueryOptions } from '@/features/guides/query-options'

export const Route = createFileRoute('/_main/guides/$nanoId/edit')({
  loader: async ({ params, context }) => {
    // Load metadata first
    const metadata = await context.queryClient.ensureQueryData(guideMetadataQueryOptions(params.nanoId))

    if (!metadata) {
      throw new Error('Guide not found')
    }

    // Prefetch locale data for the first available locale (or default)
    const initialLocale = metadata.availableLocales[0] ?? defaultLocale
    await context.queryClient.ensureQueryData(guideLocaleQueryOptions(metadata.id, initialLocale))

    return { nanoId: params.nanoId, initialLocale }
  },
  component: GuideEditPage,
  pendingComponent: GuideEditSkeleton,
})

function GuideEditPage() {
  const { nanoId, initialLocale } = Route.useLoaderData()

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={initialLocale}>
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
