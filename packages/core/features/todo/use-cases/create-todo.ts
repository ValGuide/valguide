import { createLogger } from '@valguide/logger'
import { sql } from 'drizzle-orm'
import { valguideId } from '../../../utils/nanoid'
import { db } from '../../db'
import { todo, todoTranslation } from '../schema'

const _log = createLogger('create-todo')

const _nanoid = valguideId

const _insertTodo = db
  .insert(todo)
  .values({
    key: sql.placeholder('key'),
  })
  .returning({ todoId: todo.id })
  .prepare('insert_todo')

const _insertTranslation = db
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
// export const createTodo = async ({ title }: CreateTodoParams) => {
//   const insertedTodo = await insertTodo.execute({
//     key: nanoid(),
//   })
//
//   const todoId = insertedTodo?.[0]?.todoId!
//
//   await insertTranslation.execute({
//     todoId,
//     title,
//     languageCode: 'de',
//   })
//
//   const result = db.query.todo.findFirst({
//     where: eq(todo.id, todoId),
//     with: {
//       translations: true,
//     },
//   })
//   log.info('Successfully inserted todo', result)
//   return result
// }
