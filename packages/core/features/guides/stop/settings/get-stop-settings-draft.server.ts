import { eq } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopSettingsDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type StopSettingsDraftResult = {
	id: string
	stopId: string
	coordinates: string | null
	settingsJson: string | null
	updatedAt: Date
}

// =============================================================================
// SERVER LOGIC
// =============================================================================

export async function getStopSettingsDraft(stopNanoId: string): Promise<StopSettingsDraftResult> {
	const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

	if (!foundStop) {
		throw new NotFoundError('Stop')
	}

	const [draft] = await db
		.select({
			id: stopSettingsDraft.id,
			stopId: stopSettingsDraft.stopId,
			coordinates: stopSettingsDraft.coordinates,
			settingsJson: stopSettingsDraft.settingsJson,
			updatedAt: stopSettingsDraft.updatedAt,
		})
		.from(stopSettingsDraft)
		.where(eq(stopSettingsDraft.stopId, foundStop.id))
		.limit(1)

	if (!draft) {
		throw new NotFoundError('Stop settings draft')
	}

	return draft
}
