import { queryOptions } from '@tanstack/react-query'
import {
  getOrCreateStopQrCodeFn,
  type StopQrCodePayload,
} from '@valguide/core/features/links/qr/get-or-create-stop-qr-code.fn'
import {
  getOrCreateTourQrCodeFn,
  type TourQrCodePayload,
} from '@valguide/core/features/links/qr/get-or-create-tour-qr-code.fn'
import {
  getOrgQrBrandingFn,
  type OrganizationQrBrandingSettings,
} from '@valguide/core/features/links/qr/get-org-qr-branding.fn'

export const qrQueryKeys = {
  organizationBranding: () => ['qr', 'organization-branding'] as const,
  tourCode: (tourNanoId: string) => ['qr', 'tour', tourNanoId] as const,
  stopCode: (tourNanoId: string, stopNanoId: string) => ['qr', 'tour', tourNanoId, 'stop', stopNanoId] as const,
}

export const orgQrBrandingQueryOptions = () =>
  queryOptions<OrganizationQrBrandingSettings>({
    queryKey: qrQueryKeys.organizationBranding(),
    queryFn: () => getOrgQrBrandingFn({ data: {} }),
    staleTime: 30 * 1000,
  })

export const tourQrCodeQueryOptions = (tourNanoId: string) =>
  queryOptions<TourQrCodePayload>({
    queryKey: qrQueryKeys.tourCode(tourNanoId),
    queryFn: () => getOrCreateTourQrCodeFn({ data: { tourNanoId } }),
    staleTime: 30 * 1000,
  })

export const stopQrCodeQueryOptions = (tourNanoId: string, stopNanoId: string) =>
  queryOptions<StopQrCodePayload>({
    queryKey: qrQueryKeys.stopCode(tourNanoId, stopNanoId),
    queryFn: () => getOrCreateStopQrCodeFn({ data: { tourNanoId, stopNanoId } }),
    staleTime: 30 * 1000,
  })
