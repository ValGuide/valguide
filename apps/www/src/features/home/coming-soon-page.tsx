import { useTranslations } from '@valguide/core/i18n/client'

export function ComingSoonPage() {
  const t = useTranslations('www.comingSoon')
  // i18n-used-keys: www.comingSoon.title, www.comingSoon.body

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#1c2121] px-6 text-[#f2efea]">
      <div className="text-center">
        <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">{t('title')}</h1>
        <p className="mt-5 text-base text-[#f2efea]/85 sm:text-xl">{t('body')}</p>
      </div>
    </main>
  )
}
