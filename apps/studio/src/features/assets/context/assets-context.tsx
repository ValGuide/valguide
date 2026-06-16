import type { AssetWithUsage } from '@valguide/core/features/assets/get-assets.fn'
import { createContext, useContext } from 'react'

export type AssetsContextValue = {
  assets: AssetWithUsage[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export const AssetsContext = createContext<AssetsContextValue | null>(null)

export function useAssetsContextOptional(): AssetsContextValue | null {
  return useContext(AssetsContext)
}
