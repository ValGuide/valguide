// ============================================================================
// TYPES
// ============================================================================

export type SerializableError = {
  code: string | undefined
  status: number | undefined
  name: string
  message: string
}

// ============================================================================
// HELPERS
// ============================================================================

type ErrorLike = {
  code?: string
  status?: number
  name?: string
  message?: string
}

export function serializeAuthError(error: unknown): SerializableError {
  const errorLike = (error ?? {}) as ErrorLike
  return {
    code: errorLike.code,
    status: errorLike.status,
    name: errorLike.name ?? 'AuthError',
    message: errorLike.message ?? 'Authentication failed',
  }
}
