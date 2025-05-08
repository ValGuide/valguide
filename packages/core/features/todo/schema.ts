import { pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const todo = pgTable('todo', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique('unique_todo_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const todoTranslation = pgTable(
  'todo_translation',
  {
    id: serial('id').primaryKey(),
    todoId: serial('todo_id')
      .references(() => todo.id)
      .notNull(),
    languageCode: text('language_code').notNull(),
    title: text('title'),
    description: text('description'),
  },
  (t) => ({
    uniqueTranslation: uniqueIndex('unique_translation').on(t.todoId, t.languageCode),
  }),
)
