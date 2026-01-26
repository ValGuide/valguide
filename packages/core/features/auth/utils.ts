import type { AuthError } from '@supabase/supabase-js'

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

export function serializeAuthError(error: AuthError): SerializableError {
  return {
    code: error.code,
    status: error.status,
    name: error.name,
    message: error.message,
  }
}
