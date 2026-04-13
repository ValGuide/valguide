import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
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
      <div className="sticky top-0 z-10 border-b bg-background sm:hidden">
        <div className="relative flex h-14 items-center px-4">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label={t('appName')} className="-ml-2 h-9 w-9">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-12">
            <h1 className="truncate text-base font-semibold">{t('nav.theme')}</h1>
          </div>
        </div>
      </div>
      <EditorHeader backLabel={t('appName')} onBack={handleBack} className="hidden sm:flex" />
      <div className="hidden border-b bg-background sm:block">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-1 px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t('nav.theme')}</h1>
          <p className="text-sm text-muted-foreground">{t('pages.design.themeDescription')}</p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-0 h-full w-full max-w-[96rem] flex-col">
          <ThemeCustomizerContainer
            mobileIntro={
              <p className="text-center text-sm text-muted-foreground">{t('pages.design.themeDescription')}</p>
            }
          />
        </div>
      </div>
    </main>
  )
}
