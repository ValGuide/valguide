import { notFound } from 'next/navigation'
import { db } from '@valguide/core/features/db'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/queries'
import { getLocalizedGuideText } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { GuideHero } from './components/guide-hero'
import { GuideStopList } from './components/guide-stop-list'
import { GuideMetadata } from './components/guide-metadata'
import { Metadata } from 'next'

export const dynamic = 'force-static'
export const dynamicParams = true

type Props = {
  params: Promise<{ locale: string; nanoId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, nanoId } = await params
  const guide = await getPublishedGuideByNanoId(db, nanoId)

  if (!guide) return {}

  const title = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const description = getLocalizedGuideText(guide, 'description', locale as SupportedLocale)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: guide.coverImage ? [guide.coverImage] : [],
    },
  }
}

export default async function GuidePage({ params }: Props) {
  const { locale, nanoId } = await params
  const guide = await getPublishedGuideByNanoId(db, nanoId)

  if (!guide) notFound()

  const title = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const description = getLocalizedGuideText(guide, 'description', locale as SupportedLocale)

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <GuideHero title={title} description={description} coverImage={guide.coverImage} assets={guide.assets} />

      <GuideMetadata stopCount={guide.stops.length} createdAt={guide.createdAt} locale={locale} />

      <GuideStopList stops={guide.stops} guideNanoId={nanoId} locale={locale} />
    </div>
  )
}
