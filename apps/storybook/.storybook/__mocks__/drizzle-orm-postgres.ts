// Mock drizzle-orm/postgres-js for Storybook
export function drizzle() {
  return {} as Record<string, unknown>
}

export type PostgresJsDatabase<T = unknown> = Record<string, T>
