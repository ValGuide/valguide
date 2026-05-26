import { createFileRoute } from '@tanstack/react-router'
import { LinksManagementPage } from '@/features/links/components/links-management-page'
import { managedLinksQueryOptions } from '@/features/links/query-options'
import { orgQrBrandingQueryOptions } from '@/features/qr/query-options'
import { stopsQueryOptions } from '@/features/stops/query-options'
import { toursListQueryOptions } from '@/features/tours/query-options'

export const Route = createFileRoute('/_main/links')({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(managedLinksQueryOptions(true)),
      context.queryClient.ensureQueryData(orgQrBrandingQueryOptions()),
      context.queryClient.ensureQueryData(toursListQueryOptions('en')),
      context.queryClient.ensureQueryData(stopsQueryOptions('en')),
    ])
  },
  component: LinksManagementPage,
})
