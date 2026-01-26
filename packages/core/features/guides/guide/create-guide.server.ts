import { valguideId } from '../../../utils/nanoid'
import { db } from '../../db'
import { guide, guideLocale, guideLocaleDraft, guideSettingsDraft } from '../schema'

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

    // Create guideLocale first
    const [newLocale] = await tx
      .insert(guideLocale)
      .values({
        guideId: newGuide.id,
        locale,
      })
      .returning()

    // Create draft with reference to the locale
    await tx.insert(guideLocaleDraft).values({
      guideLocaleId: newLocale.id,
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
