import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import { toGuideWithStops } from '@valguide/core/features/guides/schema'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from '../../../edit/page.client'

interface StopEditPageParams {
  locale: string
  nanoId: string
  stopId: string
}

export const dynamic = 'force-dynamic'

export default async function StopEditPage({ params }: { params: Promise<StopEditPageParams> }) {
  const { locale, nanoId, stopId } = await params
  setRequestLocale(locale)

  const guideData = await getGuideByNanoId(db, nanoId)

  if (!guideData) {
    notFound()
  }

  // Convert to flat stops array format for UI components
  const guide = toGuideWithStops(guideData)

  const stop = guide.stops.find((s) => s.id === stopId)

  if (!stop) {
    notFound()
  }

  return <GuideEditorClient guide={guide} initialStopId={stopId} />
}
