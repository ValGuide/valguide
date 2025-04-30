import { db } from '../../db'

export const getTodos = () => {
  return db.query.todo.findMany({
    with: {
      translations: true,
      tasks: {
        with: {
          task: true,
        },
      },
    },
  })
}
