import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'
import { EditorHeader } from '@/features/editor/components/editor-header'
import { useFocusBackNavigation } from '@/hooks/use-focus-back-navigation'

export const Route = createFileRoute('/_main/brand/theme')({
  staticData: {
    focusMode: true,
    hideSidebar: true,
  },
  component: ThemeBrandPage,
  pendingComponent: DesignPageSkeleton,
})

function ThemeBrandPage() {
  const t = useTranslations('sidebar')
  const handleBack = useFocusBackNavigation({ fallbackTo: '/tours' })

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <EditorHeader backLabel={t('appName')} onBack={handleBack} />
      <div className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-1 px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t('nav.theme')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.design.themeDescription')}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-0 h-full w-full max-w-[96rem] flex-col">
          <ThemeCustomizerContainer />
        </div>
      </div>
    </main>
  )
}
