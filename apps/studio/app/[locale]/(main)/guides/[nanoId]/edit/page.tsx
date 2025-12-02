import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import { toGuideWithStops } from '@valguide/core/features/guides/schema'
// biome-ignore lint/style/noRestrictedImports: notFound and redirect are only available from next/navigation
import { notFound, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from './page.client'

interface GuideEditPageParams {
  locale: string
  nanoId: string
}

interface GuideEditPageSearchParams {
  stop?: string
}

export const dynamic = 'force-dynamic'

export default async function GuideEditPage({
  params,
  searchParams,
}: {
  params: Promise<GuideEditPageParams>
  searchParams: Promise<GuideEditPageSearchParams>
}) {
  const { locale, nanoId } = await params
  const { stop: stopId } = await searchParams
  setRequestLocale(locale)

  // Redirect legacy query param to new route
  if (stopId) {
    redirect(`/${locale}/guides/${nanoId}/stops/${stopId}/edit`)
  }

  const guideData = await getGuideByNanoId(db, nanoId)

  if (!guideData) {
    notFound()
  }

  // Convert to flat stops array format for UI components
  const guide = toGuideWithStops(guideData)

  return <GuideEditorClient fallbackGuide={guide} />
}
