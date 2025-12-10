'use client'

import type { Theme } from '@valguide/core/features/themes/schema'
import useSWR from 'swr'
import {
  type CreateThemeData,
  createThemeApi,
  deleteThemeApi,
  fetchOrgThemes,
  type UpdateThemeData,
  updateThemeApi,
} from '../api/fetchers'

interface UseOrgThemesOptions {
  organizationId?: string
  enabled?: boolean
}

interface UseOrgThemesReturn {
  themes: Theme[]
  isLoading: boolean
  error: Error | null
  mutate: () => Promise<Theme[] | undefined>
  createTheme: (data: Omit<CreateThemeData, 'organizationId'>) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeData) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
}

export function useOrgThemes(options: UseOrgThemesOptions = {}): UseOrgThemesReturn {
  const { organizationId, enabled = true } = options

  const key = enabled ? ['/api/themes', organizationId] : null

  const { data, error, isLoading, mutate } = useSWR<Theme[]>(key, () => fetchOrgThemes(organizationId), {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
    keepPreviousData: true,
  })

  const createTheme = async (themeData: Omit<CreateThemeData, 'organizationId'>): Promise<Theme> => {
    if (!organizationId) {
      throw new Error('Organization ID is required to create a theme')
    }

    const created = await createThemeApi({
      ...themeData,
      organizationId,
    })

    await mutate()

    return created
  }

  const updateTheme = async (id: string, themeData: UpdateThemeData): Promise<Theme> => {
    const updated = await updateThemeApi(id, themeData)

    await mutate()

    return updated
  }

  const deleteTheme = async (id: string): Promise<void> => {
    await deleteThemeApi(id)

    await mutate()
  }

  return {
    themes: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
    createTheme,
    updateTheme,
    deleteTheme,
  }
}
