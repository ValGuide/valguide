import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getAssetImageUrl } from '@valguide/core/features/assets/image-url'
import { getPublishedGuideByNanoId } from '@valguide/core/features/guides/public/get-published-guide'
import { getLocalizedGuideText } from '@valguide/core/features/guides/public/localization-helpers'
import type { SupportedLocale } from '@valguide/core/i18n/i18n.config'
import { z } from 'zod'
import { GuideHero } from '@/components/guides/guide-hero'
import { GuideMetadata } from '@/components/guides/guide-metadata'
import { GuideStopList } from '@/components/guides/guide-stop-list'

const getGuideByNanoIdFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ nanoId: z.string() }))
  .handler(async ({ data }) => {
    const guide = await getPublishedGuideByNanoId(data.nanoId)
    return guide
  })

export const Route = createFileRoute('/g/$nanoId')({
  loader: async ({ params }) => {
    const guide = await getGuideByNanoIdFn({ data: { nanoId: params.nanoId } })
    if (!guide) {
      throw notFound()
    }
    return { guide }
  },
  component: GuidePage,
})

function GuidePage() {
  const { guide } = Route.useLoaderData()
  const { locale } = Route.useRouteContext()
  const { nanoId } = Route.useParams()

  const title = getLocalizedGuideText(guide, 'title', locale as SupportedLocale)
  const description = getLocalizedGuideText(guide, 'description', locale as SupportedLocale)
  const coverAsset = guide.assets?.find((a) => a.channel === 'images.hero')
  const coverImageUrl = coverAsset ? getAssetImageUrl(coverAsset) : null

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <GuideHero title={title} description={description} coverImage={coverImageUrl} assets={guide.assets} />
      <GuideMetadata stopCount={guide.stops.length} createdAt={guide.createdAt} locale={locale} />
      <GuideStopList stops={guide.stops} guideNanoId={nanoId} locale={locale} />
    </div>
  )
}
