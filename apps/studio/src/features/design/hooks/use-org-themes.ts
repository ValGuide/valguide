import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createThemeFn } from '@valguide/core/features/themes/create-theme.fn'
import { deleteThemeFn } from '@valguide/core/features/themes/delete-theme.fn'
import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'
import { updateThemeFn } from '@valguide/core/features/themes/update-theme.fn'
import { themesQueryKey, themesQueryOptions } from '../query-options'

export interface CreateThemeData {
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
  enabled?: boolean
}

interface UseOrgThemesReturn {
  themes: Theme[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<Theme[]>
  createTheme: (data: CreateThemeData) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeData) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
}

export function useOrgThemes(options: UseOrgThemesOptions = {}): UseOrgThemesReturn {
  const { enabled = true } = options
  const queryClient = useQueryClient()

  const { data, error, isLoading, refetch } = useQuery({
    ...themesQueryOptions(),
    enabled: enabled,
  })

  const invalidateThemes = async () => {
    await queryClient.invalidateQueries({ queryKey: themesQueryKey() })
  }

  const createTheme = async (themeData: Omit<CreateThemeData, 'organizationId'>): Promise<Theme> => {
    const created = await createThemeFn({
      data: {
        ...themeData,
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
