import { notFound, redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
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
