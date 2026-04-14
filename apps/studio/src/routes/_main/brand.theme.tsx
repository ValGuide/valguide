import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { Button } from '@valguide/ui/components/button'
import { ChevronLeft } from 'lucide-react'
import { z } from 'zod'
import { ThemeBrandPageSkeleton } from '@/features/design/components/theme-brand-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'
import { themesQueryOptions } from '@/features/design/query-options'
import { EditorHeader } from '@/features/editor/components/editor-header'
import { useFocusBackNavigation } from '@/hooks/use-focus-back-navigation'

const searchSchema = z.object({
  assistant: z.enum(['ai']).optional(),
})

export const Route = createFileRoute('/_main/brand/theme')({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(themesQueryOptions()),
  staticData: {
    focusMode: true,
    hideSidebar: true,
  },
  component: ThemeBrandPage,
  pendingComponent: ThemeBrandPageSkeleton,
})

function ThemeBrandPage() {
  const t = useTranslations('sidebar')
  const handleBack = useFocusBackNavigation({ fallbackTo: '/tours' })
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <main className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 flex min-h-0 flex-1 flex-col bg-background">
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
        <div className="mx-auto flex w-full max-w-[96rem] items-start justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t('nav.theme')}</h1>
            <p className="text-sm text-muted-foreground">{t('pages.design.themeDescription')}</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/brand/theme" search={{ assistant: 'ai' }}>
              {t('nav.aiTheme')}
            </Link>
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-3 sm:px-6 sm:py-6">
        <div className="mx-auto flex min-h-0 h-full w-full max-w-[96rem] flex-col">
          <ThemeCustomizerContainer
            openAiAssistantSignal={search.assistant === 'ai'}
            onAiAssistantSignalHandled={() => {
              navigate({
                to: '/brand/theme',
                search: {},
                replace: true,
              })
            }}
            mobileIntro={
              <p className="text-center text-sm text-muted-foreground">{t('pages.design.themeDescription')}</p>
            }
          />
        </div>
      </div>
    </main>
  )
}
