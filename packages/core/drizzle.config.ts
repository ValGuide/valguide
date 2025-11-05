import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './features/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  entities: {
    roles: {
      provider: 'supabase',
    },
  },
  dbCredentials: {
    url: process.env.VG_DATABASE_URL!,
  },
})
