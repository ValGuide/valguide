import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { ListPageHeader } from '@/components/list-page-header'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { ThemeCustomizerContainer } from '@/features/design/components/theme-customizer-container'
import { WorkspaceQrBrandingSection } from '@/features/qr/components/workspace-qr-branding-section'
import { orgQrBrandingQueryOptions } from '@/features/qr/query-options'

type BrandKitSection = 'theme' | 'qr'

type BrandKitSearch = {
  section?: BrandKitSection
}

export const Route = createFileRoute('/_main/design')({
  validateSearch: (search: Record<string, unknown>): BrandKitSearch => ({
    section: search.section === 'qr' ? 'qr' : 'theme',
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(orgQrBrandingQueryOptions())
  },
  component: DesignPage,
  pendingComponent: DesignPageSkeleton,
})

function DesignPage() {
  const t = useTranslations('sidebar')
  const search = Route.useSearch()
  const section = search.section ?? 'theme'
  const isQrSection = section === 'qr'
  const title = isQrSection ? t('nav.qrCode') : t('nav.theme')
  const description = isQrSection ? t('pages.design.qrDescription') : t('pages.design.themeDescription')

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6">
        <ListPageHeader title={title} description={description} />
        {isQrSection ? <WorkspaceQrBrandingSection /> : <ThemeCustomizerContainer />}
      </div>
    </main>
  )
}
