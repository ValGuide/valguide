import { notFound } from 'next/navigation'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { db } from '@valguide/core/features/db'
import { getGuideByNanoId } from '@valguide/core/features/guides/queries'
import Link from 'next/link'

interface GuidePageParams {
  locale: string
  nanoId: string
}

export const dynamic = 'force-dynamic'

export default async function GuidePage({ params }: { params: Promise<GuidePageParams> }) {
  const { locale, nanoId } = await params
  setRequestLocale(locale)

  const t = await getTranslations('guides')
  const guide = await getGuideByNanoId(db, nanoId)

  if (!guide) {
    notFound()
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="space-y-6">
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← {t('backToGuides')}
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {guide.translations.find((t) => t.locale === locale)?.title || guide.translations[0]?.title || 'Untitled Guide'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {guide.translations.find((t) => t.locale === locale)?.description || guide.translations[0]?.description || ''}
            </p>
          </div>
        </div>

        {guide.coverImage && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <img
              src={guide.coverImage}
              alt={guide.translations[0]?.title || 'Guide cover'}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Guide Details</h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Guide ID</dt>
              <dd className="mt-1 text-sm">{guide.nanoId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="mt-1 text-sm">{new Date(guide.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
              <dd className="mt-1 text-sm">{new Date(guide.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1 text-sm">{guide.published ? 'Published' : 'Draft'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Translations</h2>
          <div className="space-y-4">
            {guide.translations.map((translation) => (
              <div key={translation.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium uppercase">{translation.locale}</span>
                </div>
                <h3 className="font-medium">{translation.title}</h3>
                {translation.description && (
                  <p className="text-sm text-muted-foreground mt-1">{translation.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

