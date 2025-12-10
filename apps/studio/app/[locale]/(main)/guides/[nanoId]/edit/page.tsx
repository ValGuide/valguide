import { db } from '@valguide/core/features/db'
import { getGuideByNanoIdWithAssets } from '@valguide/core/features/guides/queries'
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
  locale?: string
}

export const dynamic = 'force-dynamic'

export default async function GuideEditPage({
  params,
  searchParams,
}: {
  params: Promise<GuideEditPageParams>
  searchParams: Promise<GuideEditPageSearchParams>
}) {
  const [{ locale, nanoId }, { stop: stopId, locale: editorLocale }] = await Promise.all([params, searchParams])
  setRequestLocale(locale)

  // Redirect legacy query param to new route
  if (stopId) {
    redirect(`/${locale}/guides/${nanoId}/stops/${stopId}/edit`)
  }

  const guide = await getGuideByNanoIdWithAssets(db, nanoId)

  if (!guide) {
    notFound()
  }

  return <GuideEditorClient fallbackGuide={guide} initialLocale={editorLocale} />
}
