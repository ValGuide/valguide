import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ListPageHeader } from '@/components/list-page-header'
import { AiThemePage } from '@/features/design/components/ai-theme-page'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { themeAiWorkspaceQueryOptions } from '@/features/design/theme-ai-query-options'

export const Route = createFileRoute('/_main/brand/ai')({
  loader: ({ context }) => context.queryClient.ensureQueryData(themeAiWorkspaceQueryOptions()),
  component: BrandAiPage,
  pendingComponent: DesignPageSkeleton,
})

function BrandAiPage() {
  const t = useTranslations('sidebar')

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-6">
        <ListPageHeader
          title={t('nav.aiTheme')}
          description={t('pages.design.aiDescription')}
          action={
            <Button variant="outline" asChild>
              <Link to="/brand/theme">{t('nav.theme')}</Link>
            </Button>
          }
        />
        <AiThemePage />
      </div>
    </main>
  )
}
