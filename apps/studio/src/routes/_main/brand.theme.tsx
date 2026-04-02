import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { ListPageHeader } from '@/components/list-page-header'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'

export const Route = createFileRoute('/_main/brand/theme')({
  component: ThemeBrandPage,
  pendingComponent: DesignPageSkeleton,
})

function ThemeBrandPage() {
  const t = useTranslations('sidebar')

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 pb-6">
        <ListPageHeader title={t('nav.theme')} description={t('pages.design.themeDescription')} />
        <ThemeCustomizerContainer />
      </div>
    </main>
  )
}
