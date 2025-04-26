import { pgTable, serial, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core'

export const todo = pgTable('todo', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 10 }).notNull().unique('unique_todo_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
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
    languageCode: varchar('language_code', { length: 5 }).notNull(),
    title: text('title'),
    description: text('description'),
  },
  (t) => ({
    uniqueTranslation: uniqueIndex('unique_translation').on(t.todoId, t.languageCode),
  }),
)
