'use client'

import useSWR from 'swr'
import type { Asset, AssetType } from '@valguide/core/features/assets/schema'

type UseAssetsOptions = {
  type?: AssetType
  locale?: string
  organizationId?: string
}

type AssetsResponse = {
  assets: Asset[]
}

const fetcher = async (url: string): Promise<AssetsResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch assets')
  return res.json()
}

export function useAssets(options?: UseAssetsOptions) {
  const params = new URLSearchParams()

  if (options?.type) params.set('type', options.type)
  if (options?.locale) params.set('locale', options.locale)
  if (options?.organizationId) params.set('organizationId', options.organizationId)

  const url = `/api/assets${params.toString() ? `?${params.toString()}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<AssetsResponse>(url, fetcher)

  return {
    assets: data?.assets || [],
    error,
    isLoading,
    refetch: mutate,
  }
}
