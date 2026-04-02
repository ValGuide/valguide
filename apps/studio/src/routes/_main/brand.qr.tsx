import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from '@valguide/core/i18n/client'
import { ListPageHeader } from '@/components/list-page-header'
import { DesignPageSkeleton } from '@/features/design/components/design-page-skeleton'
import { WorkspaceQrBrandingSection } from '@/features/qr/components/workspace-qr-branding-section'
import { orgQrBrandingQueryOptions } from '@/features/qr/query-options'

export const Route = createFileRoute('/_main/brand/qr')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(orgQrBrandingQueryOptions())
  },
  component: QrBrandPage,
  pendingComponent: DesignPageSkeleton,
})

function QrBrandPage() {
  const t = useTranslations('sidebar')

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-6">
        <ListPageHeader title={t('nav.qrCode')} description={t('pages.design.qrDescription')} />
        <WorkspaceQrBrandingSection />
      </div>
    </main>
  )
}
