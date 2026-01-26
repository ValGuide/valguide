import { createThemeFn } from '@valguide/core/features/themes/create-theme'
import { deleteThemeFn } from '@valguide/core/features/themes/delete-theme'
import { updateThemeFn } from '@valguide/core/features/themes/update-theme'
import { getThemesFn } from './get-themes'

// Re-export theme server functions from core + studio
export { createThemeFn, deleteThemeFn, getThemesFn, updateThemeFn }
