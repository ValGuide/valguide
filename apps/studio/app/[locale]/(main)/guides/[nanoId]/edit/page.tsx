import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
// biome-ignore lint/style/noRestrictedImports: notFound is only available from next/navigation
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { GuideEditorClient } from './page.client'

interface GuideEditPageParams {
  locale: string
  nanoId: string
}

export const dynamic = 'error'

export default async function GuideEditPage({ params }: { params: Promise<GuideEditPageParams> }) {
  const { locale, nanoId } = await params
  setRequestLocale(locale)

  const guide = await getGuideByNanoId(db, nanoId)

  if (!guide) {
    notFound()
  }

  return <GuideEditorClient guide={guide} />
}
