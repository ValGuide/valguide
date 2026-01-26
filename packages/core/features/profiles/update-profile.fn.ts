import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { profiles } from './schema'

// =============================================================================
// TYPES
// =============================================================================

export type UpdateProfileInput = {
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  is_onboarded?: boolean
}

export type UpdateProfileResult = typeof profiles.$inferSelect

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function updateProfile(userId: string, data: UpdateProfileInput): Promise<UpdateProfileResult> {
  const [result] = await db
    .insert(profiles)
    .values({
      id: userId,
      ...data,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    })
    .returning()

  return result
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const updateProfileSchema = z.object({
  username: z.string().nullable().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  is_onboarded: z.boolean().optional(),
})

export const updateProfileFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(updateProfileSchema)
  .handler(async ({ context, data }) => {
    return updateProfile(context.user.id, data)
  })
