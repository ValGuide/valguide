import { createThemeQueryOptions } from '@valguide/core/features/app-theme/query-options'
import { getThemeFn } from './server-functions'

export const themeQueryOptions = () => createThemeQueryOptions(getThemeFn)
