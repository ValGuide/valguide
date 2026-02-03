import { valguideId } from '../../../utils/nanoid'
import { db } from '../../db'
import { guide, guideLocaleDraft, guideSettingsDraft } from '../schema'

// =============================================================================
// TYPES
// =============================================================================

export type CreateGuideInput = {
  title?: string
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

    await tx.insert(guideLocaleDraft).values({
      guideId: newGuide.id,
      locale,
      title: input.title,
      updatedBy: userId,
    })

    await tx.insert(guideSettingsDraft).values({
      guideId: newGuide.id,
      updatedBy: userId,
    })

    return { nanoId, locale }
  })
}
