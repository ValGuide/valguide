import { integer, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'
import { organization } from '../orgs/schema'

const studioSchema = pgSchema('studio')

export const feedback = studioSchema.table('feedback', {
  id: uuid('id').defaultRandom().primaryKey(),

  // User who submitted feedback
  userId: uuid('user_id').references(() => authUsers.id, { onDelete: 'set null' }),

  // Feedback content
  message: text('message').notNull(),

  // Screenshot (optional)
  screenshotUrl: text('screenshot_url'), // Public URL
  screenshotPath: text('screenshot_path'), // Storage path like "studio-feedback/userId/file.png"

  // Context
  pageUrl: text('page_url'), // Captured page URL where feedback was submitted

  // Team/Organization (optional)
  teamId: uuid('team_id').references(() => organization.id, { onDelete: 'set null' }),

  // Denormalized user info for Slack (avoids joins)
  userEmail: text('user_email').notNull(),
  userName: text('user_name'),
  teamName: text('team_name'),

  // File metadata (for screenshots)
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'), // e.g., 'image/png'

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// =============================================================================
// TypeScript Types
// =============================================================================

export type Feedback = typeof feedback.$inferSelect
export type NewFeedback = typeof feedback.$inferInsert
