/**
 * Supabase Storage RLS Policies
 *
 * Managed via Drizzle migrations (db:generate + db:migrate).
 * The storage.objects table is owned by Supabase — we only manage the RLS policies.
 *
 * Bucket creation is handled separately via `pnpm storage:push:dev/prod`
 * which executes supabase/init-buckets.sql (INSERT INTO storage.buckets).
 */

import { sql } from 'drizzle-orm'
import { pgPolicy, pgSchema, text, uuid } from 'drizzle-orm/pg-core'
import { anonRole, authenticatedRole } from 'drizzle-orm/supabase'

const storageSchema = pgSchema('storage')

/**
 * Reference to Supabase's storage.objects table.
 * NOT managed by Drizzle — only used as a .link() target for policies.
 * Only the columns referenced in policies are listed here.
 */
const storageObjects = storageSchema.table('objects', {
  id: uuid().primaryKey(),
  bucket_id: text(),
  name: text(),
  owner: uuid(),
})

// =============================================================================
// Assets Bucket — Organization-scoped policies
// =============================================================================

export const assetsInsertPolicy = pgPolicy('Users can upload to their org', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text`,
}).link(storageObjects)

export const assetsSelectPolicy = pgPolicy("Users can read their org's files", {
  as: 'permissive',
  for: 'select',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text`,
}).link(storageObjects)

export const assetsUpdatePolicy = pgPolicy("Users can update their org's files", {
  as: 'permissive',
  for: 'update',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = (auth.jwt() ->> 'organization_id')::text`,
}).link(storageObjects)

export const assetsDeletePolicy = pgPolicy('Users can delete own uploads', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND owner = auth.uid()`,
}).link(storageObjects)

// =============================================================================
// Assets Bucket — User namespace policies (users/{userId}/...)
// =============================================================================

export const userNamespaceInsertPolicy = pgPolicy('Users can upload to their own user namespace', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

export const userNamespaceSelectPolicy = pgPolicy('Users can read their own user namespace', {
  as: 'permissive',
  for: 'select',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

export const userNamespaceUpdatePolicy = pgPolicy('Users can update their own user namespace', {
  as: 'permissive',
  for: 'update',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

// =============================================================================
// Feedback Bucket — studio-feedback policies
// =============================================================================

export const feedbackInsertPolicy = pgPolicy('Feedback: users can upload to their folder', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'studio-feedback' AND (storage.foldername(name))[1] = auth.uid()::text`,
}).link(storageObjects)

export const feedbackSelectPolicy = pgPolicy('Feedback: public read access', {
  as: 'permissive',
  for: 'select',
  to: anonRole,
  using: sql`bucket_id = 'studio-feedback'`,
}).link(storageObjects)

export const feedbackDeletePolicy = pgPolicy('Feedback: users can delete own uploads', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'studio-feedback' AND owner = auth.uid()`,
}).link(storageObjects)
