/**
 * Pure TypeScript type definitions for profiles feature.
 * These mirror the Drizzle-inferred types but don't import from schema.ts,
 * making them safe to import in browser/Storybook environments.
 */

export interface Profile {
  id: string
  is_onboarded: boolean
  username: string | null
  firstName: string | null
  lastName: string | null
  createdAt: Date
  updatedAt: Date | null
  onboardedAt: Date | null
}

export type NewProfile = Partial<Omit<Profile, 'id' | 'createdAt'>> & {
  id: string
}
