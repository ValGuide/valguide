import { queryOptions } from '@tanstack/react-query'
import {
  getThemeAiWorkspaceFn,
  type ThemeAiWorkspaceData,
} from '@valguide/core/features/themes/get-theme-ai-workspace.fn'

export const themeAiWorkspaceQueryKey = () => ['theme-ai-workspace'] as const

export const themeAiWorkspaceQueryOptions = () =>
  queryOptions<ThemeAiWorkspaceData>({
    queryKey: themeAiWorkspaceQueryKey(),
    queryFn: () => getThemeAiWorkspaceFn(),
    staleTime: 30 * 1000,
  })
