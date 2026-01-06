import type { Theme } from '@valguide/core/features/themes/schema'
import type { ThemeColors, ThemeFonts, ThemePreset } from '@valguide/core/features/themes/types'
import useSWR from 'swr'
import { createThemeFn, deleteThemeFn, getThemesFn, updateThemeFn } from '../server-functions'

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
  mutate: () => Promise<Theme[] | undefined>
  createTheme: (data: Omit<CreateThemeData, 'organizationId'>) => Promise<Theme>
  updateTheme: (id: string, data: UpdateThemeData) => Promise<Theme>
  deleteTheme: (id: string) => Promise<void>
}

async function fetchOrgThemes(organizationId?: string): Promise<Theme[]> {
  const data = await getThemesFn({ data: { organizationId } })
  return data as Theme[]
}

export function useOrgThemes(options: UseOrgThemesOptions = {}): UseOrgThemesReturn {
  const { organizationId, enabled = true } = options

  const key = enabled ? ['themes', organizationId] : null

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

    const created = await createThemeFn({
      data: {
        ...themeData,
        organizationId,
      },
    })

    await mutate()

    return created as Theme
  }

  const updateTheme = async (id: string, themeData: UpdateThemeData): Promise<Theme> => {
    const updated = await updateThemeFn({
      data: {
        id,
        ...themeData,
      },
    })

    await mutate()

    return updated as Theme
  }

  const deleteTheme = async (id: string): Promise<void> => {
    await deleteThemeFn({ data: { id } })

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
