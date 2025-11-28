import { pgEnum } from 'drizzle-orm/pg-core'

export const translationStatus = pgEnum('translation_status', ['draft', 'in_review', 'published', 'archived'])
