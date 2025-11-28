import { db } from '@valguide/core/features/db'
import {
  getGuideIdByStopNanoId,
  getPublishedGuideByNanoId,
  getStopByNanoId,
} from '@valguide/core/features/guides/queries'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { StopContent } from './components/stop-content'
import { StopNavigation } from './components/stop-navigation'

export const dynamic = 'force-static'
export const dynamicParams = true

type Props = {
  params: Promise<{ locale: string; nanoId: string; stopNanoId: string }>
}

export default async function StopPage({ params }: Props) {
  const { locale, nanoId, stopNanoId } = await params
  const stop = await getStopByNanoId(db, stopNanoId)

  if (!stop) notFound()

  const guideId = await getGuideIdByStopNanoId(db, stopNanoId)
  if (!guideId) notFound()

  const guide = await getPublishedGuideByNanoId(db, nanoId)
  if (!guide) notFound()

  const currentIndex = guide.stops.findIndex((s) => s.nanoId === stopNanoId)
  if (currentIndex === -1) notFound()

  return (
    <div className="container max-w-3xl py-8 space-y-8">
      <StopContent stop={stop} locale={locale} stopNumber={currentIndex + 1} />

      <StopNavigation guideNanoId={nanoId} currentIndex={currentIndex} stops={guide.stops} locale={locale} />
    </div>
  )
}
