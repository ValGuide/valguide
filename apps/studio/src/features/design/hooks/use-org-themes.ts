import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'
import { themesQueryKey, themesQueryOptions } from '../query-options'
import { createThemeFn, deleteThemeFn, updateThemeFn } from '../server-functions'

export interface CreateThemeData {
  organizationId: string
  name: string
  basePreset: ThemePreset
  colors: ThemeColors
  radius: number
  fonts: ThemeFonts
}

export interface UpdateThemeData {
  name?: string
  basePreset?: ThemePreset
  colors?: ThemeColors
  radius?: number
  fonts?: ThemeFonts
}

interface UseOrgThemesOptions {
  organizationId?: string
  enabled?: boolean
}

interface UseOrgThemesReturn {
  themes: Theme[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<Theme[]>
  createTheme: (data: Omit<CreateThemeData, 'organizationId'>) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeData) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
}

export function useOrgThemes(options: UseOrgThemesOptions = {}): UseOrgThemesReturn {
  const { organizationId, enabled = true } = options
  const queryClient = useQueryClient()

  const { data, error, isLoading, refetch } = useQuery({
    ...themesQueryOptions(organizationId),
    enabled: enabled && !!organizationId,
  })

  const invalidateThemes = async () => {
    await queryClient.invalidateQueries({ queryKey: themesQueryKey(organizationId) })
  }

  const createTheme = async (themeData: Omit<CreateThemeData, 'organizationId'>): Promise<Theme> => {
    if (!organizationId) {
      throw new Error('Organization ID is required to create a theme')
    }

    const created = await createThemeFn({
      data: {
        ...themeData,
        organizationId,
      },
    })

    await invalidateThemes()

    return created as Theme
  }

  const updateTheme = async (id: string, themeData: UpdateThemeData): Promise<Theme> => {
    const updated = await updateThemeFn({
      data: {
        id,
        ...themeData,
      },
    })

    await invalidateThemes()

    return updated as Theme
  }

  const deleteTheme = async (id: string): Promise<void> => {
    await deleteThemeFn({ data: { id } })

    await invalidateThemes()
  }

  return {
    themes: data ?? [],
    isLoading,
    error: error ?? null,
    refetch: async () => {
      const result = await refetch()
      return result.data ?? []
    },
    createTheme,
    updateTheme,
    deleteTheme,
  }
}
