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
