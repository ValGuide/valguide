import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { db } from '../db'
import { guide, guideTranslation, guideTranslationVersion } from './schema'
import {
  upsertGuideTranslationDraft,
  publishGuideTranslationDraft,
  rollbackGuideTranslation,
  deleteGuideTranslationDraft,
} from './translation-mutations'
import { getGuideTranslationHistory, getDraftGuideTranslation, getCurrentGuideTranslation } from './translation-queries'
import { eq } from 'drizzle-orm'

describe.skip('Translation Versioning', () => {
  let testGuideId: string
  const testUserId = '00000000-0000-0000-0000-000000000001'

  beforeAll(async () => {
    // Create a test guide
    const [testGuide] = await db
      .insert(guide)
      .values({
        nanoId: `test-${Date.now()}`,
        createdBy: testUserId,
        updatedBy: testUserId,
      })
      .returning()
    testGuideId = testGuide.id
  })

  afterAll(async () => {
    // Cleanup
    if (testGuideId) {
      await db.delete(guide).where(eq(guide.id, testGuideId))
    }
  })

  it('should create a draft translation', async () => {
    const versionId = await upsertGuideTranslationDraft(
      testGuideId,
      'en',
      { title: 'Test Guide', description: 'Test description' },
      testUserId,
    )

    expect(versionId).toBeTruthy()

    const draft = await getDraftGuideTranslation(testGuideId, 'en')
    expect(draft).toBeTruthy()
    expect(draft?.title).toBe('Test Guide')
    expect(draft?.status).toBe('draft')
  })

  it('should publish a draft', async () => {
    const result = await publishGuideTranslationDraft(testGuideId, 'en')

    expect(result.success).toBe(true)

    const current = await getCurrentGuideTranslation(testGuideId, 'en')
    expect(current).toBeTruthy()
    expect(current?.status).toBe('published')
    expect(current?.title).toBe('Test Guide')

    const draft = await getDraftGuideTranslation(testGuideId, 'en')
    expect(draft).toBeNull()
  })

  it('should create a new draft after publishing', async () => {
    const versionId = await upsertGuideTranslationDraft(
      testGuideId,
      'en',
      { title: 'Updated Guide', description: 'Updated description' },
      testUserId,
    )

    expect(versionId).toBeTruthy()

    const draft = await getDraftGuideTranslation(testGuideId, 'en')
    expect(draft?.title).toBe('Updated Guide')

    const current = await getCurrentGuideTranslation(testGuideId, 'en')
    expect(current?.title).toBe('Test Guide') // Should still be the old version
  })

  it('should show version history', async () => {
    const history = await getGuideTranslationHistory(testGuideId, 'en')

    expect(history.length).toBeGreaterThanOrEqual(2)
    expect(history[0].version).toBeGreaterThan(history[1].version) // Ordered by version desc
  })

  it('should rollback to a previous version', async () => {
    const result = await rollbackGuideTranslation(testGuideId, 'en', 1, testUserId)

    expect(result.success).toBe(true)

    const draft = await getDraftGuideTranslation(testGuideId, 'en')
    expect(draft?.title).toBe('Test Guide') // Rolled back to version 1
  })

  it('should delete a draft', async () => {
    const deleted = await deleteGuideTranslationDraft(testGuideId, 'en')

    expect(deleted).toBe(true)

    const draft = await getDraftGuideTranslation(testGuideId, 'en')
    expect(draft).toBeNull()
  })
})
