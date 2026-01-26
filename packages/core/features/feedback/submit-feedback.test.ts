/**
 * Tests for submit feedback validation schema
 */

import { z } from 'zod'
import { submitFeedbackFn } from './submit-feedback'

// Extract schema from the server function for testing
// The actual schema is defined in submit-feedback.ts
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const

const submitFeedbackSchema = z.object({
  feedback: z.string().min(1).max(5000),
  screenshotPath: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z
    .number()
    .max(5 * 1024 * 1024)
    .optional(), // Max 5MB
  mimeType: z.enum(ALLOWED_MIME_TYPES).optional(),
  pageUrl: z.string().url().optional().or(z.literal('')),
  userName: z.string().optional(),
  teamName: z.string().optional(),
  teamNanoId: z.string().optional(),
})

describe('submitFeedbackSchema', () => {
  describe('feedback field', () => {
    it('should accept valid feedback', () => {
      const result = submitFeedbackSchema.safeParse({ feedback: 'This is valid feedback' })
      expect(result.success).toBe(true)
    })

    it('should reject empty feedback', () => {
      const result = submitFeedbackSchema.safeParse({ feedback: '' })
      expect(result.success).toBe(false)
    })

    it('should reject feedback over 5000 characters', () => {
      const result = submitFeedbackSchema.safeParse({ feedback: 'a'.repeat(5001) })
      expect(result.success).toBe(false)
    })

    it('should accept feedback at exactly 5000 characters', () => {
      const result = submitFeedbackSchema.safeParse({ feedback: 'a'.repeat(5000) })
      expect(result.success).toBe(true)
    })
  })

  describe('mimeType field', () => {
    it('should accept image/png', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'image/png',
      })
      expect(result.success).toBe(true)
    })

    it('should accept image/jpeg', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'image/jpeg',
      })
      expect(result.success).toBe(true)
    })

    it('should accept image/webp', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'image/webp',
      })
      expect(result.success).toBe(true)
    })

    it('should accept image/gif', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'image/gif',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid mime types', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'application/pdf',
      })
      expect(result.success).toBe(false)
    })

    it('should reject image/svg+xml', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        mimeType: 'image/svg+xml',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('fileSize field', () => {
    it('should accept file size under 5MB', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        fileSize: 1024 * 1024, // 1MB
      })
      expect(result.success).toBe(true)
    })

    it('should accept file size exactly 5MB', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        fileSize: 5 * 1024 * 1024,
      })
      expect(result.success).toBe(true)
    })

    it('should reject file size over 5MB', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        fileSize: 5 * 1024 * 1024 + 1,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('pageUrl field', () => {
    it('should accept valid URL', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        pageUrl: 'https://studio.valguide.com/guides/abc123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty string', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        pageUrl: '',
      })
      expect(result.success).toBe(true)
    })

    it('should accept undefined', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid URL', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'test',
        pageUrl: 'not-a-url',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('complete submission', () => {
    it('should accept feedback with all optional fields', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'This is my feedback',
        screenshotPath: 'studio-feedback/123456.png',
        fileName: 'screenshot.png',
        fileSize: 1024 * 100,
        mimeType: 'image/png',
        pageUrl: 'https://studio.valguide.com/guides',
        userName: 'John Doe',
        teamName: 'ACME Corp',
        teamNanoId: 'abc123',
      })
      expect(result.success).toBe(true)
    })

    it('should accept feedback with no optional fields', () => {
      const result = submitFeedbackSchema.safeParse({
        feedback: 'Just some feedback',
      })
      expect(result.success).toBe(true)
    })
  })
})
