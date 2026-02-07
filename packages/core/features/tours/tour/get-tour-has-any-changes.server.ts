import { sql } from 'drizzle-orm'
import { db } from '../../db'

export async function getTourHasAnyChanges(tourId: string): Promise<boolean> {
  const result = await db.execute<{ has_changes: boolean }>(sql`
		SELECT (
			EXISTS(
				SELECT 1
				FROM studio.tour_settings_draft d
				FULL JOIN studio.tour_settings l ON l.tour_id = d.tour_id
				WHERE COALESCE(d.tour_id, l.tour_id) = ${tourId}
				  AND (
				    d.tour_id IS NULL
				    OR l.tour_id IS NULL
				    OR d.theme_id IS DISTINCT FROM l.theme_id
				    OR d.settings_json IS DISTINCT FROM l.settings_json
				  )
			)
			OR EXISTS(
				SELECT stop_id, position, visible
				FROM studio.tour_stop_draft WHERE tour_id = ${tourId}
				EXCEPT
				SELECT stop_id, position, visible
				FROM studio.tour_stop WHERE tour_id = ${tourId}
			)
			OR EXISTS(
				SELECT stop_id, position, visible
				FROM studio.tour_stop WHERE tour_id = ${tourId}
				EXCEPT
				SELECT stop_id, position, visible
				FROM studio.tour_stop_draft WHERE tour_id = ${tourId}
			)
			OR EXISTS(
				SELECT asset_id, channel, locale, position
				FROM studio.tour_asset_draft WHERE tour_id = ${tourId}
				EXCEPT
				SELECT asset_id, channel, locale, position
				FROM studio.tour_asset WHERE tour_id = ${tourId}
			)
			OR EXISTS(
				SELECT asset_id, channel, locale, position
				FROM studio.tour_asset WHERE tour_id = ${tourId}
				EXCEPT
				SELECT asset_id, channel, locale, position
				FROM studio.tour_asset_draft WHERE tour_id = ${tourId}
			)
			OR EXISTS(
				SELECT 1
				FROM studio.tour_stop_draft ts
				JOIN studio.stop_locale_draft sd ON sd.stop_id = ts.stop_id
				LEFT JOIN studio.stop_locale sl ON sl.stop_id = sd.stop_id AND sl.locale = sd.locale
				WHERE ts.tour_id = ${tourId}
				  AND (
				    sl.id IS NULL
				    OR NULLIF(BTRIM(sd.title), '') IS DISTINCT FROM NULLIF(BTRIM(sl.title), '')
				    OR NULLIF(BTRIM(sd.description), '') IS DISTINCT FROM NULLIF(BTRIM(sl.description), '')
				    OR NULLIF(BTRIM(sd.transcription), '') IS DISTINCT FROM NULLIF(BTRIM(sl.transcription), '')
				  )
			)
			OR EXISTS(
				SELECT 1
				FROM studio.tour_stop_draft ts
				JOIN studio.stop_locale sl ON sl.stop_id = ts.stop_id
				LEFT JOIN studio.stop_locale_draft sd ON sd.stop_id = sl.stop_id AND sd.locale = sl.locale
				WHERE ts.tour_id = ${tourId}
				  AND sd.id IS NULL
			)
		) AS has_changes
	`)

  return result[0]?.has_changes ?? false
}
