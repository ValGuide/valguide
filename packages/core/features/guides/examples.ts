/**
 * Example usage of the guides i18n schema
 *
 * This file demonstrates how to create, query, and work with
 * multilingual guide content.
 */

import { db } from '../db'
import { createGuide, getAllGuides, getGuideByNanoId, updateGuideTranslation } from './queries'
import { getLocalizedGuideText } from './schema'

/**
 * Example 1: Create a new guide with multiple languages
 * NanoId is automatically generated if not provided
 */
async function exampleCreateGuide(userId: string, orgId: string) {
  const guide = await createGuide(
    db,
    {
      // nanoId: 'museum-tour-2024', // Optional - auto-generated if not provided
      createdBy: userId,
      updatedBy: userId,
      organizationId: orgId,
      coverImage: 'https://example.com/cover.jpg',
      // published: new Date(), // Uncomment to publish immediately
    },
    [
      {
        locale: 'en',
        title: 'Museum Audio Tour 2024',
        description: 'Explore the highlights of our collection with this guided audio tour.',
      },
      {
        locale: 'de',
        title: 'Museums-Audiotour 2024',
        description: 'Entdecken Sie die Highlights unserer Sammlung mit dieser geführten Audiotour.',
      },
      {
        locale: 'rm',
        title: "Tur d'audio dal museum 2024",
        description: "Scuvri ils accents da nossa collecziun cun questa tur d'audio guidada.",
      },
    ],
  )

  console.log('Created guide:', guide.id)
  return guide
}

/**
 * Example 2: Query a guide and get localized content
 */
async function exampleGetLocalizedGuide(guideNanoId: string, userLocale: 'en' | 'de' | 'rm') {
  const guide = await getGuideByNanoId(db, guideNanoId)

  if (!guide) {
    throw new Error('Guide not found')
  }

  // Get title in user's locale with English fallback
  const title = getLocalizedGuideText(guide, 'title', userLocale, 'en')
  const description = getLocalizedGuideText(guide, 'description', userLocale, 'en')

  console.log(`Guide in ${userLocale}:`)
  console.log(`Title: ${title}`)
  console.log(`Description: ${description}`)

  return {
    ...guide,
    title,
    description,
  }
}

/**
 * Example 3: List all guides with English titles
 */
async function exampleListGuides() {
  const guides = await getAllGuides(db)

  const guidesWithTitles = guides.map((guide) => ({
    id: guide.id,
    nanoId: guide.nanoId,
    title: getLocalizedGuideText(guide, 'title', 'en'),
    published: guide.published,
    createdAt: guide.createdAt,
  }))

  console.log('All guides:', guidesWithTitles)
  return guidesWithTitles
}

/**
 * Example 4: Add a new language translation to existing guide
 */
async function exampleAddNewLanguage(guideId: string) {
  // Add French translation (no migration needed!)
  const frenchTranslation = await updateGuideTranslation(db, guideId, 'fr', {
    title: 'Visite audio du musée 2024',
    description: 'Découvrez les points forts de notre collection avec cette visite audio guidée.',
  })

  console.log('Added French translation:', frenchTranslation.id)
  return frenchTranslation
}

/**
 * Example 5: Update an existing translation
 */
async function exampleUpdateTranslation(guideId: string) {
  const updated = await updateGuideTranslation(db, guideId, 'en', {
    title: 'Updated Museum Audio Tour 2024',
    description: 'New and improved description!',
  })

  console.log('Updated translation:', updated.id)
  return updated
}

/**
 * Example 6: Get guide with only specific locale (efficient query)
 */
async function exampleEfficientQuery(guideId: string, locale: 'en' | 'de' | 'rm') {
  // This queries only one translation instead of all
  const result = await db.query.guide.findFirst({
    where: (guide, { eq }) => eq(guide.id, guideId),
    with: {
      translations: {
        where: (translation, { eq }) => eq(translation.locale, locale),
        limit: 1,
        with: {
          currentVersion: true,
        },
      },
    },
  })

  if (!result) return null

  return {
    ...result,
    title: result.translations[0]?.currentVersion?.title,
    description: result.translations[0]?.currentVersion?.description,
  }
}

// Export examples for use in other files
export {
  exampleCreateGuide,
  exampleGetLocalizedGuide,
  exampleListGuides,
  exampleAddNewLanguage,
  exampleUpdateTranslation,
  exampleEfficientQuery,
}
