import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { profiles } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type Profile = typeof profiles.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function getProfile(userId: string): Promise<Profile | undefined> {
  return db.query.profiles.findFirst({
    where: eq(profiles.id, userId),
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

export const getProfileFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    return getProfile(context.user.id)
  })
