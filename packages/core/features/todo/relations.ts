import { relations } from 'drizzle-orm'
import { todo, todoTranslation } from './schema'
import { taskToTodo } from '../task/schema'

export const todoRelations = relations(todo, ({ many }) => ({
  translations: many(todoTranslation),
  tasks: many(taskToTodo),
}))

export const todoTranslationRelations = relations(todoTranslation, ({ one }) => ({
  // Each translation belongs to one todo
  todo: one(todo, {
    fields: [todoTranslation.todoId],
    references: [todo.id],
  }),
}))
