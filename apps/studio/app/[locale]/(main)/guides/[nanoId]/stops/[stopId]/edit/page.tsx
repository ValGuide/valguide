import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import { toGuideWithStops } from '@valguide/core/features/guides/schema'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from '../../../edit/page.client'

interface GuideStopEditPageParams {
  locale: string
  nanoId: string
  stopId: string
}

export const dynamic = 'force-dynamic'

export default async function GuideStopEditPage({ params }: { params: Promise<GuideStopEditPageParams> }) {
  const { locale, nanoId, stopId } = await params
  setRequestLocale(locale)

  const guideData = await getGuideByNanoId(db, nanoId)

  if (!guideData) {
    notFound()
  }

  const guide = toGuideWithStops(guideData)

  return <GuideEditorClient fallbackGuide={guide} initialSelectedStopId={stopId} />
}
