import { relations } from 'drizzle-orm'
import { index, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from '../auth/schema'

const studioSchema = pgSchema('studio')

export const ORG_ROLES = ['owner', 'admin', 'curator', 'editor', 'viewer'] as const
export type OrgRole = (typeof ORG_ROLES)[number]

export function isOrgRole(value: string): value is OrgRole {
  return ORG_ROLES.includes(value as OrgRole)
}

export const INVITATION_STATUS = ['pending', 'accepted', 'rejected', 'canceled'] as const
export type InvitationStatus = (typeof INVITATION_STATUS)[number]

export const organization = studioSchema.table('organization', {
  id: uuid('id').defaultRandom().primaryKey(),
  nanoId: varchar('nano_id', { length: 21 }).notNull().unique('unique_org_nano_id'),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique('unique_org_slug'),
  logoStoragePath: text('logo_storage_path'),
  defaultThemeId: uuid('default_theme_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
}))

export const member = studioSchema.table(
  'member',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 32 }).notNull().default('viewer'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqueMember: uniqueIndex('member_unique').on(t.organizationId, t.userId),
    userIdIdx: index('member_user_id_idx').on(t.userId),
    orgUserIdx: index('member_org_user_idx').on(t.organizationId, t.userId),
  }),
)

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(authUsers, {
    fields: [member.userId],
    references: [authUsers.id],
  }),
}))

export const invitation = studioSchema.table(
  'invitation',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    email: varchar('email', { length: 255 }).notNull(),
    role: varchar('role', { length: 32 }).notNull().default('viewer'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    inviterId: uuid('inviter_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index('invitation_email_idx').on(t.email),
    orgIdx: index('invitation_org_id_idx').on(t.organizationId),
    orgEmailStatusIdx: index('invitation_org_email_status_idx').on(t.organizationId, t.email, t.status),
  }),
)

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(authUsers, {
    fields: [invitation.inviterId],
    references: [authUsers.id],
  }),
}))

// =============================================================================
// SLUG REDIRECT LOG (append-only, old slugs only)
// =============================================================================

export const organizationSlug = studioSchema.table(
  'organization_slug',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 100 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    uniqueSlug: uniqueIndex('organization_slug_unique').on(t.slug),
    orgIdx: index('organization_slug_org_idx').on(t.organizationId),
  }),
)

export const organizationSlugRelations = relations(organizationSlug, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationSlug.organizationId],
    references: [organization.id],
  }),
}))

// Types
export type OrganizationSlug = typeof organizationSlug.$inferSelect
export type NewOrganizationSlug = typeof organizationSlug.$inferInsert
