import { eq, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopSettings } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishStopSettingsResult = {
  published: boolean
}

// =============================================================================
// SERVER LOGIC
// =============================================================================

export async function publishStopSettings(stopNanoId: string, userId: string): Promise<PublishStopSettingsResult> {
  const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return db.transaction(async (tx) => {
    // 1. Lock stop row
    await tx.select({ id: stop.id }).from(stop).where(eq(stop.id, foundStop.id)).for('update')

    // 2. Delete existing live settings
    await tx.delete(stopSettings).where(eq(stopSettings.stopId, foundStop.id))

    // 3. Copy draft → live
    await tx.execute(sql`
			INSERT INTO studio.stop_settings (id, stop_id, coordinates, settings_json, published_at, published_by)
			SELECT gen_random_uuid(), stop_id, coordinates, settings_json, NOW(), ${userId}
			FROM studio.stop_settings_draft
			WHERE stop_id = ${foundStop.id}
		`)

    return { published: true }
  })
}
