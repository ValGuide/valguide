/**
 * Shared types for stop locale features.
 * Safe for Storybook/browser imports.
 */

/**
 * Stop translation content (includes transcription field)
 * Used by stop locale editors and components
 */
export type StopTranslationContent = {
  id: string
  title: string | null
  description: string | null
  transcription: string | null
}
