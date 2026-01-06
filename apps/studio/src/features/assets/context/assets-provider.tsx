import type { AssetType } from '@valguide/core/features/assets/schema'
import type { ReactNode } from 'react'
import { useAssets } from '../hooks/use-assets'
import { AssetsContext, type AssetsContextValue } from './assets-context'

export type UseAssetsOptions = {
  type?: AssetType
  locale?: string
  organizationId?: string
  enabled?: boolean
}

export type AssetsProviderProps = {
  children: ReactNode
  options?: UseAssetsOptions
  value?: AssetsContextValue
}

export function AssetsProvider({ children, options, value }: AssetsProviderProps) {
  const assetsData = useAssets({ ...options, enabled: !value && (options?.enabled ?? true) })

  const contextValue: AssetsContextValue = value ?? {
    assets: assetsData.assets,
    isLoading: assetsData.isLoading,
    error: assetsData.error ?? null,
    refetch: assetsData.refetch,
  }

  return <AssetsContext.Provider value={contextValue}>{children}</AssetsContext.Provider>
}
