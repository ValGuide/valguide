import { integer, pgTable, primaryKey, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { todo } from '../todo/schema'

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 10 }).notNull().unique('unique_task_key'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const taskToTodo = pgTable(
  'task_to_todo',
  {
    taskId: integer('task_id')
      .notNull()
      .references(() => task.id),
    todoId: integer('todo_id')
      .notNull()
      .references(() => todo.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.taskId, t.todoId] }) }),
)
