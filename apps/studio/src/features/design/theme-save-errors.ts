const THEME_NAME_CONSTRAINT = 'theme_unique_name_per_org'

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return undefined
}

function getErrorMessage(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return undefined
}

function isDuplicateThemeNameError(error: unknown): boolean {
  const message = getErrorMessage(error)?.toLowerCase() ?? ''
  const code = getErrorCode(error)

  if (code === '23505') {
    return true
  }

  return message.includes(THEME_NAME_CONSTRAINT) || message.includes('duplicate key value violates unique constraint')
}

export function getThemeSaveErrorMessage(
  error: unknown,
  t: (key: 'saveDialog.nameExists' | 'saveDialog.saveFailed') => string,
): string {
  if (isDuplicateThemeNameError(error)) {
    return t('saveDialog.nameExists')
  }

  return getErrorMessage(error) ?? t('saveDialog.saveFailed')
}
