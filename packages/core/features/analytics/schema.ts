import { index, pgEnum, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { organization } from '../orgs/schema'
import { stop, tour } from '../tours/schema'

const analyticsSchema = pgSchema('analytics')

export const guideAnalyticsEventType = pgEnum('guide_analytics_event_type', [
  'tour_opened',
  'stop_opened',
  'audio_played',
])

export const guideAnalyticsEvent = analyticsSchema.table(
  'event',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    tourId: uuid('tour_id')
      .notNull()
      .references(() => tour.id, { onDelete: 'cascade' }),
    stopId: uuid('stop_id').references(() => stop.id, { onDelete: 'cascade' }),
    visitorId: varchar('visitor_id', { length: 64 }).notNull(),
    eventType: guideAnalyticsEventType('event_type').notNull(),
    locale: varchar('locale', { length: 10 }),
    path: text('path'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventOrgCreatedIdx: index('analytics_event_org_created_idx').on(table.organizationId, table.createdAt),
    eventTourCreatedIdx: index('analytics_event_tour_created_idx').on(table.tourId, table.createdAt),
    eventTypeCreatedIdx: index('analytics_event_type_created_idx').on(table.eventType, table.createdAt),
    eventVisitorIdx: index('analytics_event_visitor_idx').on(table.visitorId),
  }),
)
