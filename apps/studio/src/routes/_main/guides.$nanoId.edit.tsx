import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { publishGuideLocaleFn } from '@valguide/core/features/guides/guide/locale/publish-guide-locale.fn'
import { unpublishGuideLocaleFn } from '@valguide/core/features/guides/guide/locale/unpublish-guide-locale.fn'
import { updateStopVisibilityFn } from '@valguide/core/features/guides/structure/update-stop-visibility.fn'
import { MediaPickerConnected } from '@/features/assets/components/media-picker/media-picker-connected'
import { GuideEditSkeleton } from '@/features/guides/components/guide-edit-skeleton'
import { GuideEditView } from '@/features/guides/components/guide-edit-view'
import { GuideEditorProvider } from '@/features/guides/contexts/guide-editor-context'
import { useGuideEditor } from '@/features/guides/contexts/guide-editor-types'
import { guideDetailQueryOptions, guideLocaleDraftQueryOptions } from '@/features/guides/query-options'

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
    const guideDetail = await context.queryClient.ensureQueryData(guideDetailQueryOptions(params.nanoId))

    if (!guideDetail) {
      throw notFound()
    }

    const requestedLocale = deps.locale
    const { availableLocales } = guideDetail

    // Redirect if locale missing or invalid
    if (!requestedLocale || !availableLocales.includes(requestedLocale)) {
      const defaultLocale = availableLocales[0]
      if (!defaultLocale) throw notFound()
      throw redirect({
        to: '/guides/$nanoId/edit',
        params: { nanoId: params.nanoId },
        search: { locale: defaultLocale },
        replace: true,
      })
    }

    await context.queryClient.ensureQueryData(guideLocaleDraftQueryOptions(params.nanoId, requestedLocale))

    return { nanoId: params.nanoId, locale: requestedLocale }
  },
  component: GuideEditPage,
  pendingComponent: GuideEditSkeleton,
})

function GuideEditPage() {
  const { nanoId, locale } = Route.useLoaderData()

  return (
    <GuideEditorProvider nanoId={nanoId} initialLocale={locale}>
      <GuideEditContent />
    </GuideEditorProvider>
  )
}

function GuideEditContent() {
  const { guideDetail, nanoId } = useGuideEditor()

  if (!guideDetail) {
    return <GuideEditSkeleton />
  }

  return (
    <GuideEditView
      onPublish={(_guideId, locale) => publishGuideLocaleFn({ data: { nanoId, locale } })}
      onUnpublish={(_guideId, locale) => unpublishGuideLocaleFn({ data: { nanoId, locale } })}
      onHideStop={(_guideId, stopNanoId) =>
        updateStopVisibilityFn({ data: { guideNanoId: nanoId, stopNanoId, visible: false } })
      }
      onShowStop={(_guideId, stopNanoId) =>
        updateStopVisibilityFn({ data: { guideNanoId: nanoId, stopNanoId, visible: true } })
      }
      MediaPicker={MediaPickerConnected}
    />
  )
}
