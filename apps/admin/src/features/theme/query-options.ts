import { createThemeQueryOptions } from '@valguide/core/features/app-theme/query-options'
import { getThemeFn } from './get-theme.fn'

export const themeQueryOptions = () => createThemeQueryOptions(getThemeFn)
