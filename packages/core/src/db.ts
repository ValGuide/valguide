import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql, {
  schema,
  logger: process.env.DRIIZLE_LOG_ENABLED === 'true',
})

export type DB = typeof db

const run = async () => {
  db.query.todo
    .findFirst({
      with: {
        translations: true,
      },
    })
    .then((todo) => {
      const a: (string | null)[] | undefined = todo?.translations?.map((t) => t.title)
    })

  await db.query.todo
    .findMany({
      with: {
        tasks: {
          with: {
            task: true,
          },
        },
      },
    })
    .then((r) =>
      r.map((u) => {
        u.tasks.map((t) => t.task.key)
      }),
    )
}
