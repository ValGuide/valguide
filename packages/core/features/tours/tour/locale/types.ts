/**
 * Shared types for tour locale features.
 * Safe for Storybook/browser imports.
 */

/**
 * Translation content (title and description)
 * Used by tour locale editors and components
 */
export type TranslationContent = {
  id: string
  title: string | null
  description: string | null
}
