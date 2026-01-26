import { and, eq, isNull, sql } from 'drizzle-orm'
import { NotFoundError } from '../../../auth/authorization'
import { db } from '../../../db'
import { stop, stopAssetDraft } from '../../schema'

// =============================================================================
// TYPES
// =============================================================================

export type AssignStopAssetInput = {
	assetId: string
	channel: string
	locale?: string | null
	position?: number
}

export type AssignStopAssetResult = {
	id: string
	assigned: boolean
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function assignStopAsset(stopNanoId: string, input: AssignStopAssetInput): Promise<AssignStopAssetResult> {
	const [foundStop] = await db.select({ id: stop.id }).from(stop).where(eq(stop.nanoId, stopNanoId)).limit(1)

	if (!foundStop) {
		throw new NotFoundError('Stop')
	}

	const locale = input.locale ?? null

	// Check if already assigned
	const localeCondition = locale === null ? isNull(stopAssetDraft.locale) : eq(stopAssetDraft.locale, locale)

	const [existing] = await db
		.select({ id: stopAssetDraft.id })
		.from(stopAssetDraft)
		.where(
			and(
				eq(stopAssetDraft.stopId, foundStop.id),
				eq(stopAssetDraft.assetId, input.assetId),
				eq(stopAssetDraft.channel, input.channel),
				localeCondition,
			),
		)
		.limit(1)

	if (existing) {
		return { id: existing.id, assigned: false }
	}

	// Get next position if not provided
	let position = input.position
	if (position === undefined) {
		const [{ maxPos }] = await db
			.select({ maxPos: sql<number>`COALESCE(MAX(position), -1)` })
			.from(stopAssetDraft)
			.where(and(eq(stopAssetDraft.stopId, foundStop.id), eq(stopAssetDraft.channel, input.channel), localeCondition))
		position = maxPos + 1
	}

	const [inserted] = await db
		.insert(stopAssetDraft)
		.values({
			stopId: foundStop.id,
			assetId: input.assetId,
			channel: input.channel,
			locale,
			position,
		})
		.returning({ id: stopAssetDraft.id })

	return { id: inserted.id, assigned: true }
}
