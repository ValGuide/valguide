import { db } from '@valguide/core/features/db'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/queries'
import { getLocalizedGuideText } from '@valguide/core/features/guides/schema'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import type { Metadata } from 'next'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { GuideHero } from './components/guide-hero'
import { GuideMetadata } from './components/guide-metadata'
import { GuideStopList } from './components/guide-stop-list'

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
  const coverAsset = guide.assets?.find((a) => a.role === 'cover')
  const coverImageUrl = coverAsset?.publicUrl

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: coverImageUrl ? [coverImageUrl] : [],
    },
  }
}

export default async function GuidePage({ params }: Props) {
  const { locale, nanoId } = await params
  const guide = await getPublishedGuideByNanoId(db, nanoId)

  if (!guide) notFound()

  const title = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const description = getLocalizedGuideText(guide, 'description', locale as SupportedLocale)
  const coverAsset = guide.assets?.find((a) => a.role === 'cover')
  const coverImageUrl = coverAsset?.publicUrl ?? null

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <GuideHero title={title} description={description} coverImage={coverImageUrl} assets={guide.assets} />

      <GuideMetadata stopCount={guide.stops.length} createdAt={guide.createdAt} locale={locale} />

      <GuideStopList stops={guide.stops} guideNanoId={nanoId} locale={locale} />
    </div>
  )
}
