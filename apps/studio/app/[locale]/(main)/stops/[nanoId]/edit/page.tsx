import { getStopByNanoId } from '@valguide/core/features/guides/stop-queries'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { StandaloneStopEditorClient } from './page.client'

interface StopEditPageParams {
  locale: string
  nanoId: string
}

export const dynamic = 'force-dynamic'

export default async function StopEditPage({ params }: { params: Promise<StopEditPageParams> }) {
  const { locale, nanoId } = await params
  setRequestLocale(locale)

  const stop = await getStopByNanoId(nanoId)

  if (!stop) {
    notFound()
  }

  return <StandaloneStopEditorClient fallbackStop={stop} />
}
