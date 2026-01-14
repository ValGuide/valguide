import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { PageTitle } from '@valguide/ui/components/page-title'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'

export const Route = createFileRoute('/_main/design')({
  component: DesignPage,
  pendingComponent: DesignPageSkeleton,
})

function DesignPage() {
  const t = useTranslations('sidebar')
  return (
    <main className="flex flex-col flex-1 min-h-0 p-4 pt-0">
      <div className="mb-6 space-y-1">
        <PageTitle as="h2">{t('nav.design')}</PageTitle>
        <p className="text-sm text-muted-foreground">{t('pages.design.description')}</p>
      </div>
      <div className="flex-1 min-h-0">
        <ThemeCustomizerContainer />
      </div>
    </main>
  )
}
