/**
 * Supabase Storage RLS Policies
 *
 * Managed via Drizzle migrations (db:generate + db:migrate).
 * The storage.objects table is owned by Supabase — we only manage the RLS policies.
 *
 * Bucket creation is handled separately via `pnpm storage:push:dev/prod`
 * which executes supabase/init-buckets.sql (INSERT INTO storage.buckets).
 *
 * ## Path Patterns (Feb 2026)
 *
 * | Namespace        | Path                                      | Bucket           |
 * |------------------|-------------------------------------------|------------------|
 * | Asset uploads    | assets/{assetId}/{fileId}.{ext}            | assets           |
 * | Org logos        | orgs/{orgNanoId}/{fileId}.{ext}            | assets           |
 * | Profile avatars  | users/{profileId}/{fileId}.{ext}           | assets           |
 * | Feedback         | feedback/{feedbackId}/{fileId}.{ext}       | studio-feedback  |
 *
 * Authorization for assets and org logos is enforced at the server function level,
 * NOT via RLS path matching. Paths are org-independent so assets can move between
 * orgs without S3 migration.
 *
 * @see docs/patterns/file-uploads.md
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
// Assets Bucket — "assets/" namespace (org-independent asset files)
// =============================================================================
// Authorization is enforced by server functions (confirmAssetUploadFn, etc.).
// RLS only checks: authenticated + correct bucket + correct namespace prefix.

export const assetsInsertPolicy = pgPolicy('assets: authenticated users can upload to assets namespace', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets'`,
}).link(storageObjects)

export const assetsSelectPolicy = pgPolicy('assets: authenticated users can read assets namespace', {
  as: 'permissive',
  for: 'select',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets'`,
}).link(storageObjects)

export const assetsUpdatePolicy = pgPolicy('assets: authenticated users can update assets namespace', {
  as: 'permissive',
  for: 'update',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets'`,
}).link(storageObjects)

export const assetsDeletePolicy = pgPolicy('assets: owner can delete own uploads', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'assets' AND owner = auth.uid()`,
}).link(storageObjects)

// =============================================================================
// Assets Bucket — "orgs/" namespace (org logos)
// =============================================================================
// Authorization is enforced by updateOrgLogoFn (requireOrgMember check).
// RLS only checks: authenticated + correct bucket + correct namespace prefix.

export const orgsInsertPolicy = pgPolicy('orgs: authenticated users can upload org logos', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs'`,
}).link(storageObjects)

export const orgsSelectPolicy = pgPolicy('orgs: authenticated users can read org logos', {
  as: 'permissive',
  for: 'select',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs'`,
}).link(storageObjects)

export const orgsUpdatePolicy = pgPolicy('orgs: authenticated users can update org logos', {
  as: 'permissive',
  for: 'update',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs'`,
}).link(storageObjects)

export const orgsDeletePolicy = pgPolicy('orgs: owner can delete org logos', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'orgs' AND owner = auth.uid()`,
}).link(storageObjects)

// =============================================================================
// Assets Bucket — "users/" namespace (profile avatars)
// =============================================================================
// profileId = auth.uid(), so we can enforce user-scoped access via RLS.

export const userNamespaceInsertPolicy = pgPolicy('users: can upload to own user namespace', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

export const userNamespaceSelectPolicy = pgPolicy('users: can read own user namespace', {
  as: 'permissive',
  for: 'select',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

export const userNamespaceUpdatePolicy = pgPolicy('users: can update own user namespace', {
  as: 'permissive',
  for: 'update',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
  withCheck: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

export const userNamespaceDeletePolicy = pgPolicy('users: can delete own user namespace', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'assets' AND (storage.foldername(name))[1] = 'users' AND (storage.foldername(name))[2] = auth.uid()::text`,
}).link(storageObjects)

// =============================================================================
// Feedback Bucket — "feedback/" namespace (studio-feedback)
// =============================================================================
// Any authenticated user can submit feedback. Public read for Slack integration.

export const feedbackInsertPolicy = pgPolicy('feedback: authenticated users can upload screenshots', {
  as: 'permissive',
  for: 'insert',
  to: authenticatedRole,
  withCheck: sql`bucket_id = 'studio-feedback' AND (storage.foldername(name))[1] = 'feedback'`,
}).link(storageObjects)

export const feedbackSelectPolicy = pgPolicy('feedback: public read access', {
  as: 'permissive',
  for: 'select',
  to: anonRole,
  using: sql`bucket_id = 'studio-feedback'`,
}).link(storageObjects)

export const feedbackDeletePolicy = pgPolicy('feedback: owner can delete own uploads', {
  as: 'permissive',
  for: 'delete',
  to: authenticatedRole,
  using: sql`bucket_id = 'studio-feedback' AND owner = auth.uid()`,
}).link(storageObjects)
