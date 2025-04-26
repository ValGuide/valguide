'use server'

import type { CreateTodoParams } from '@valguide/core/todo/use-cases/create-todo'
import { createTodo } from '@valguide/core/todo/use-cases/create-todo'
import { revalidatePath } from 'next/cache'
import { createLogger } from '@valguide/logger'

const log = createLogger('console-actions')

export const createTodoAction = async (params: CreateTodoParams): Promise<void> => {
  const todo = await createTodo(params)

  log.info('Todo created:', todo)
  revalidatePath('/console')
}
