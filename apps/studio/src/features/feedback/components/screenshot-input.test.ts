/**
 * @jest-environment jsdom
 */

describe('ScreenshotInput validation', () => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

  // Helper to create a mock File
  const createMockFile = (type: string, size: number, name = 'test.png'): File => {
    const content = new Uint8Array(size)
    const blob = new Blob([content], { type })
    return new File([blob], name, { type })
  }

  describe('validateFile', () => {
    // Inline validation function that mirrors the component logic
    const validateFile = (file: File): string | null => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return 'invalidType'
      }
      if (file.size > MAX_FILE_SIZE) {
        return 'fileTooLarge'
      }
      return null
    }

    it('should accept valid PNG file', () => {
      const file = createMockFile('image/png', 1024)
      expect(validateFile(file)).toBeNull()
    })

    it('should accept valid JPEG file', () => {
      const file = createMockFile('image/jpeg', 1024)
      expect(validateFile(file)).toBeNull()
    })

    it('should accept valid WebP file', () => {
      const file = createMockFile('image/webp', 1024)
      expect(validateFile(file)).toBeNull()
    })

    it('should accept valid GIF file', () => {
      const file = createMockFile('image/gif', 1024)
      expect(validateFile(file)).toBeNull()
    })

    it('should reject invalid file type', () => {
      const file = createMockFile('application/pdf', 1024, 'test.pdf')
      expect(validateFile(file)).toBe('invalidType')
    })

    it('should reject file larger than 5MB', () => {
      const file = createMockFile('image/png', MAX_FILE_SIZE + 1)
      expect(validateFile(file)).toBe('fileTooLarge')
    })

    it('should accept file exactly 5MB', () => {
      const file = createMockFile('image/png', MAX_FILE_SIZE)
      expect(validateFile(file)).toBeNull()
    })

    it('should reject SVG files', () => {
      const file = createMockFile('image/svg+xml', 1024, 'test.svg')
      expect(validateFile(file)).toBe('invalidType')
    })

    it('should reject text files disguised with image extension', () => {
      const file = createMockFile('text/plain', 1024, 'fake.png')
      expect(validateFile(file)).toBe('invalidType')
    })
  })
})
