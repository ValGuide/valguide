import type { Asset } from '@valguide/core/features/assets/types'
import { createContext, useContext } from 'react'

export type AssetsContextValue = {
  assets: Asset[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export const AssetsContext = createContext<AssetsContextValue | null>(null)

export function useAssetsContext(): AssetsContextValue {
  const context = useContext(AssetsContext)
  if (!context) {
    throw new Error('useAssetsContext must be used within an AssetsProvider')
  }
  return context
}

export function useAssetsContextOptional(): AssetsContextValue | null {
  return useContext(AssetsContext)
}
