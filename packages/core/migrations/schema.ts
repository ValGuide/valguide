import { pgTable, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const translationStatus = pgEnum("translation_status", ['draft', 'in_review', 'published', 'archived'])



