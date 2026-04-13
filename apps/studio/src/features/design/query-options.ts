import { queryOptions } from '@tanstack/react-query'
import {
  type BrandThemeSettings,
  getBrandThemeSettingsFn,
} from '@valguide/core/features/themes/get-brand-theme-settings.fn'

export const themesQueryKey = () => ['themes'] as const

export const themesQueryOptions = () =>
  queryOptions<BrandThemeSettings>({
    queryKey: themesQueryKey(),
    queryFn: () => getBrandThemeSettingsFn(),
    staleTime: 30 * 1000,
  })
