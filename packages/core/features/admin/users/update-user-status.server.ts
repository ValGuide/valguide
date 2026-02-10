import { createClient } from '@supabase/supabase-js'
import type { DB } from '@valguide/core/features/db'
import { eq } from 'drizzle-orm'
import { serverEnv } from '../../../env/server'
import { profiles } from '../../profiles/schema'

export type UpdateUserStatusInput = {
  userId: string
  status: 'approved' | 'blocked'
  blockedReason?: string
}

export async function updateUserStatus(dbClient: DB, input: UpdateUserStatusInput) {
  const { userId, status, blockedReason } = input

  if (status === 'approved') {
    await dbClient
      .update(profiles)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        blockedAt: null,
        blockedReason: null,
      })
      .where(eq(profiles.id, userId))
  } else {
    await dbClient
      .update(profiles)
      .set({
        status: 'blocked',
        blockedAt: new Date(),
        blockedReason: blockedReason ?? null,
      })
      .where(eq(profiles.id, userId))

    if (serverEnv.SUPABASE_SECRET_KEY) {
      const adminClient = createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      await adminClient.auth.admin.signOut(userId, 'global')
    }
  }

  return { success: true }
}
