import { integer, pgTable, primaryKey, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { todo } from '../todo/schema'

export const task = pgTable('task', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique('unique_task_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
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
  (t) => [{ pk: primaryKey({ columns: [t.taskId, t.todoId] }) }],
)
