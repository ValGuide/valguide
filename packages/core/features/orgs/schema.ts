import { boolean, index, pgEnum, pgSchema, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { authUsers } from 'drizzle-orm/supabase'
import { relations } from 'drizzle-orm'

const studioSchema = pgSchema('studio')

export const orgRole = pgEnum('org_role', ['owner', 'admin', 'curator', 'editor', 'viewer'])
export type OrgRole = typeof orgRole.enumValues[number]

export const organization = studioSchema.table('organization', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique('unique_org_slug'),
  logo: text('logo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(organizationMember),
  invitations: many(organizationInvitation),
}))

export const organizationMember = studioSchema.table('organization_member', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  role: orgRole('role').notNull().default('editor'),
  isOwner: boolean('is_owner').default(false), // Deprecated, keep for backward compat
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
}, (t) => ({
  uniqueMember: uniqueIndex('organization_member_unique').on(t.organizationId, t.userId),
  userIdIdx: index('org_member_user_id_idx').on(t.userId),
  orgUserIdx: index('org_member_org_user_idx').on(t.organizationId, t.userId),
}))

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationMember.organizationId],
    references: [organization.id],
  }),
  user: one(authUsers, {
    fields: [organizationMember.userId],
    references: [authUsers.id],
  }),
}))

export const organizationInvitation = studioSchema.table('organization_invitation', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: orgRole('role').notNull().default('editor'),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => authUsers.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(), // 7 days from creation
  acceptedAt: timestamp('accepted_at'),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  emailIdx: index('org_invite_email_idx').on(t.email),
  orgIdx: index('org_invite_org_id_idx').on(t.organizationId),
}))

export const organizationInvitationRelations = relations(organizationInvitation, ({ one }) => ({
  organization: one(organization, {
    fields: [organizationInvitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(authUsers, {
    fields: [organizationInvitation.invitedBy],
    references: [authUsers.id],
  }),
}))

