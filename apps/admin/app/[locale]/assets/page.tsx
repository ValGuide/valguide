import { getTranslations } from 'next-intl/server'

export default async function AssetsPage() {
  const t = await getTranslations('admin.assets')

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('comingSoon')}</p>
      </div>
    </div>
  )
}
