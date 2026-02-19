import { createClient } from '@supabase/supabase-js'
import { serverEnv } from '@valguide/core/env/server'
import type { DB } from '@valguide/core/features/db'
import { organization } from '@valguide/core/features/orgs/schema'
import { valguideId } from '@valguide/core/utils/nanoid'
import { eq } from 'drizzle-orm'

export type AdminUploadOrgLogoInput = {
  orgNanoId: string
  base64: string
  mimeType: string
}

export type AdminUploadOrgLogoResult = {
  success: boolean
  logoUrl?: string
  error?: string
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function adminUploadOrgLogo(
  dbClient: DB,
  input: AdminUploadOrgLogoInput,
): Promise<AdminUploadOrgLogoResult> {
  if (!ALLOWED_MIME_TYPES.includes(input.mimeType)) {
    return { success: false, error: 'Invalid file type. Use PNG, JPEG, WebP, or GIF.' }
  }

  const buffer = Buffer.from(input.base64, 'base64')
  if (buffer.length > MAX_SIZE_BYTES) {
    return { success: false, error: 'File too large. Maximum 5MB.' }
  }

  // Resolve org
  const orgs = await dbClient
    .select({ id: organization.id, nanoId: organization.nanoId })
    .from(organization)
    .where(eq(organization.nanoId, input.orgNanoId))
    .limit(1)

  const org = orgs[0]
  if (!org) return { success: false, error: 'Organization not found' }

  const ext = input.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : input.mimeType.split('/')[1]
  const storagePath = `orgs/${org.nanoId}/${valguideId()}.${ext}`

  // Upload via service role (bypasses RLS)
  const supabase = createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: uploadError } = await supabase.storage
    .from('assets')
    .upload(storagePath, buffer, { contentType: input.mimeType, upsert: false })

  if (uploadError) {
    return { success: false, error: 'Upload failed' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('assets').getPublicUrl(storagePath)

  // Update org logo
  await dbClient.update(organization).set({ logo: publicUrl }).where(eq(organization.id, org.id))

  return { success: true, logoUrl: publicUrl }
}
