import { db } from '@valguide/core/features/db'
import { getStopByNanoId } from '@valguide/core/features/guides/queries'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'

import { StandaloneStopEditorClient } from './page.client'

interface StopEditPageParams {
  locale: string
  nanoId: string
}

interface StopEditPageSearchParams {
  locale?: string
}

export const dynamic = 'force-dynamic'

export default async function StopEditPage({
  params,
  searchParams,
}: {
  params: Promise<StopEditPageParams>
  searchParams: Promise<StopEditPageSearchParams>
}) {
  const [{ nanoId }, { locale: editorLocale }] = await Promise.all([params, searchParams])

  const stop = await getStopByNanoId(db, nanoId)

  if (!stop) {
    notFound()
  }

  return <StandaloneStopEditorClient fallbackStop={stop} initialLocale={editorLocale} />
}
