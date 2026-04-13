import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import type { OrgRole } from '@valguide/core/features/orgs/schema'
import { createThemeFn } from '@valguide/core/features/themes/create-theme.fn'
import { deleteThemeFn } from '@valguide/core/features/themes/delete-theme.fn'
import type { BrandThemeSettings, Theme } from '@valguide/core/features/themes/get-brand-theme-settings.fn'
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

type ThemeActions = Pick<
  UseOrgThemesReturn,
  'createTheme' | 'updateTheme' | 'deleteTheme' | 'setDefaultTheme' | 'clearDefaultTheme'
>

function buildOrgThemesReturn(
  data: BrandThemeSettings | undefined,
  error: Error | null,
  isLoading: boolean,
  refetchThemes: () => Promise<Theme[]>,
  actions: ThemeActions,
): UseOrgThemesReturn {
  return {
    organizationId: data?.organizationId ?? null,
    themes: data?.themes ?? [],
    defaultThemeId: data?.defaultThemeId ?? null,
    defaultThemeName: data?.defaultThemeName ?? null,
    currentUserRole: data?.currentUserRole ?? null,
    isLoading,
    error,
    refetch: refetchThemes,
    ...actions,
  }
}

function useThemeActions(data: BrandThemeSettings | undefined): ThemeActions {
  const queryClient = useQueryClient()

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
    createTheme,
    updateTheme,
    deleteTheme,
    setDefaultTheme,
    clearDefaultTheme,
  }
}

export function useOrgThemes(options: UseOrgThemesOptions = {}): UseOrgThemesReturn {
  const { enabled = true } = options

  const { data, error, isLoading, refetch } = useQuery({
    ...themesQueryOptions(),
    enabled,
  })
  const actions = useThemeActions(data)

  return buildOrgThemesReturn(
    data,
    error ?? null,
    isLoading,
    async () => {
      const result = await refetch()
      return result.data?.themes ?? []
    },
    actions,
  )
}

export function useOrgThemesSuspense(): UseOrgThemesReturn {
  const { data, refetch } = useSuspenseQuery(themesQueryOptions())
  const actions = useThemeActions(data)

  return buildOrgThemesReturn(
    data,
    null,
    false,
    async () => {
      const result = await refetch()
      return result.data.themes
    },
    actions,
  )
}
