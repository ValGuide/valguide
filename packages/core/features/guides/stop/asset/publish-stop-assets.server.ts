import { and, eq, isNull, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAsset } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type PublishStopAssetsInput = {
	channel: string
	locale?: string | null
}

export type PublishStopAssetsResult = {
	published: number
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function publishStopAssets(
	stopNanoId: string,
	input: PublishStopAssetsInput,
): Promise<PublishStopAssetsResult> {
	const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

	if (!foundStop) {
		throw new NotFoundError('Stop')
	}

	const locale = input.locale ?? null

	return db.transaction(async (tx) => {
		// 1. Lock stop row
		await tx.select({ id: stop.id }).from(stop).where(eq(stop.id, foundStop.id)).for('update')

		// 2. Delete live assets for this channel+locale
		const localeCondition = locale === null ? isNull(stopAsset.locale) : eq(stopAsset.locale, locale)

		await tx
			.delete(stopAsset)
			.where(and(eq(stopAsset.stopId, foundStop.id), eq(stopAsset.channel, input.channel), localeCondition))

		// 3. Copy draft → live
		const result = await tx.execute<{ count: number }>(sql`
			WITH inserted AS (
				INSERT INTO studio.stop_asset (id, stop_id, asset_id, channel, locale, position, published_at)
				SELECT gen_random_uuid(), stop_id, asset_id, channel, locale, position, NOW()
				FROM studio.stop_asset_draft
				WHERE stop_id = ${foundStop.id}
					AND channel = ${input.channel}
					AND ${locale === null ? sql`locale IS NULL` : sql`locale = ${locale}`}
				RETURNING 1
			)
			SELECT COUNT(*)::int AS count FROM inserted
		`)

		return { published: result[0]?.count ?? 0 }
	})
}
