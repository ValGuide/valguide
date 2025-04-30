import { db } from '../../db'
import { eq, sql } from 'drizzle-orm'
import { todo, todoTranslation } from '../schema'
import { customAlphabet } from 'nanoid'
import { createLogger } from '@valguide/logger'

const log = createLogger('create-todo')

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10)

const insertTodo = db
  .insert(todo)
  .values({
    key: sql.placeholder('key'),
  })
  .returning({ todoId: todo.id })
  .prepare('insert_todo')

const insertTranslation = db
  .insert(todoTranslation)
  .values({
    todoId: sql.placeholder('todoId'),
    title: sql.placeholder('title'),
    languageCode: sql.placeholder('languageCode'),
  })
  .prepare('insert_translation')

export type CreateTodoParams = {
  title?: string | null
}

// TODO DB: Replace with transaction
export const createTodo = async ({ title }: CreateTodoParams) => {
  const insertedTodo = await insertTodo.execute({
    key: nanoid(),
  })

  const todoId = insertedTodo?.[0]?.todoId!

  await insertTranslation.execute({
    todoId,
    title,
    languageCode: 'de',
  })

  const result = db.query.todo.findFirst({
    where: eq(todo.id, todoId),
    with: {
      translations: true,
    },
  })
  log.info('Successfully inserted todo', result)
  return result
}
