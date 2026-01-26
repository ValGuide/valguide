import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { valguideId } from '../../../utils/nanoid'
import { requireOrgMember } from '../../auth/authorization'
import { requireAuthMiddleware } from '../../auth/middleware'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft, guideSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type CreateGuideInput = {
  title: string
  locale?: string
}

export type CreateGuideResult = {
  nanoId: string
  locale: string
}

// =============================================================================
// INTERNAL FUNCTION
// =============================================================================

export async function createGuide(
  input: CreateGuideInput,
  organizationId: string,
  userId: string,
): Promise<CreateGuideResult> {
  const locale = input.locale ?? 'en'

  return db.transaction(async (tx) => {
    const nanoId = valguideId()

    const [newGuide] = await tx
      .insert(guide)
      .values({
        nanoId,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
        availableLocales: [locale],
      })
      .returning()

    const [draft] = await tx
      .insert(guideLocaleDraft)
      .values({
        guideLocaleId: newGuide.id,
        title: input.title,
        updatedBy: userId,
      })
      .returning()

    await tx.insert(guideLocale).values({
      guideId: newGuide.id,
      locale,
      draftId: draft.id,
    })

    await tx.insert(guideSettingsDraft).values({
      guideId: newGuide.id,
      updatedBy: userId,
    })

    return { nanoId, locale }
  })
}

// =============================================================================
// SERVER FUNCTION
// =============================================================================

const createGuideSchema = z.object({
  title: z.string().min(1),
  locale: z.string().optional(),
})

export const createGuideFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(createGuideSchema)
  .handler(async ({ context, data }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }
    await requireOrgMember(orgId, context.user.id)
    return createGuide(data, orgId, context.user.id)
  })
