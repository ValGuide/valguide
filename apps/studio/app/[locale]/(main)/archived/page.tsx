import { redirect } from 'next/navigation'
import { getArchivedGuides } from '@valguide/core/features/guides/queries'
import { createClient } from '@valguide/core/supabase/server'
import { getTranslations } from 'next-intl/server'
import { ArchivedGuidesList } from '@/features/guides/components/archived-guides-list'
import { db } from '@valguide/core/features/db'

export default async function ArchivedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const guides = await getArchivedGuides(db, user.id)
  const t = await getTranslations('guides')

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">{t('archived')}</h1>
      <ArchivedGuidesList guides={guides} userId={user.id} />
    </div>
  )
}
