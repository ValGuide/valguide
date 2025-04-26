import { relations } from 'drizzle-orm'
import { todo } from '../todo/schema'
import { task, taskToTodo } from './schema'

export const taskRelations = relations(task, ({ many }) => ({
  todos: many(taskToTodo),
}))

export const taskToTodoRelations = relations(taskToTodo, ({ one }) => ({
  todo: one(todo, {
    fields: [taskToTodo.todoId],
    references: [todo.id],
  }),
  task: one(task, {
    fields: [taskToTodo.taskId],
    references: [task.id],
  }),
}))
