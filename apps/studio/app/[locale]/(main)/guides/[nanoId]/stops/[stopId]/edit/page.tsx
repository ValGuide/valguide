import { db } from '@valguide/core/features/db'
import { getGuideByNanoIdWithAssets } from '@valguide/core/features/guides/queries'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from '../../../edit/page.client'

interface GuideStopEditPageParams {
  locale: string
  nanoId: string
  stopId: string
}

interface GuideStopEditPageSearchParams {
  locale?: string
}

export const dynamic = 'force-dynamic'

export default async function GuideStopEditPage({
  params,
  searchParams,
}: {
  params: Promise<GuideStopEditPageParams>
  searchParams: Promise<GuideStopEditPageSearchParams>
}) {
  const [{ locale, nanoId, stopId }, { locale: editorLocale }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)

  const guide = await getGuideByNanoIdWithAssets(db, nanoId)

  if (!guide) {
    notFound()
  }

  return <GuideEditorClient fallbackGuide={guide} initialSelectedStopId={stopId} initialLocale={editorLocale} />
}
