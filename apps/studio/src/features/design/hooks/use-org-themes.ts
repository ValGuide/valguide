import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { createThemeFn } from '@valguide/core/features/themes/create-theme.fn'
import { deleteThemeFn } from '@valguide/core/features/themes/delete-theme.fn'
import type { Theme } from '@valguide/core/features/themes/get-brand-theme-settings.fn'
import { setOrgDefaultThemeFn } from '@valguide/core/features/themes/set-org-default-theme.fn'
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
  organizationId: string | null
  themes: Theme[]
  defaultThemeId: string | null
  defaultThemeName: string | null
  currentUserRole: OrgRole | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<Theme[]>
  createTheme: (data: CreateThemeData) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeData) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
  setDefaultTheme: (id: string) => Promise<void>
  clearDefaultTheme: () => Promise<void>
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
    await queryClient.invalidateQueries({ queryKey: ['tour'] })
    await queryClient.invalidateQueries({ queryKey: ['tours'] })
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

  const setDefaultTheme = async (id: string): Promise<void> => {
    if (!data?.organizationId) {
      throw new Error('No active organization')
    }

    await setOrgDefaultThemeFn({
      data: {
        organizationId: data.organizationId,
        themeId: id,
      },
    })

    await invalidateThemes()
  }

  const clearDefaultTheme = async (): Promise<void> => {
    if (!data?.organizationId) {
      throw new Error('No active organization')
    }

    await setOrgDefaultThemeFn({
      data: {
        organizationId: data.organizationId,
        themeId: null,
      },
    })

    await invalidateThemes()
  }

  return {
    organizationId: data?.organizationId ?? null,
    themes: data?.themes ?? [],
    defaultThemeId: data?.defaultThemeId ?? null,
    defaultThemeName: data?.defaultThemeName ?? null,
    currentUserRole: data?.currentUserRole ?? null,
    isLoading,
    error: error ?? null,
    refetch: async () => {
      const result = await refetch()
      return result.data?.themes ?? []
    },
    createTheme,
    updateTheme,
    deleteTheme,
    setDefaultTheme,
    clearDefaultTheme,
  }
}
