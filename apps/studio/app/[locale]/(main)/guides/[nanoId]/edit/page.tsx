import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import { toGuideWithStops } from '@valguide/core/features/guides/schema'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from './page.client'

interface GuideEditPageParams {
  locale: string
  nanoId: string
}

export const dynamic = 'force-dynamic'

export default async function GuideEditPage({ params }: { params: Promise<GuideEditPageParams> }) {
  const { locale, nanoId } = await params
  setRequestLocale(locale)

  const guideData = await getGuideByNanoId(db, nanoId)

  if (!guideData) {
    notFound()
  }

  // Convert to flat stops array format for UI components
  const guide = toGuideWithStops(guideData)

  return <GuideEditorClient fallbackGuide={guide} />
}
