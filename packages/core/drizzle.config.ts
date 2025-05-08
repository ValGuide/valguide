import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.VG_DATABASE_URL!,
  },
})
