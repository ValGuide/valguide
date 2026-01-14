import { notFound, redirect } from '@tanstack/react-router'
import { ForbiddenError, NotFoundError } from '@valguide/core/features/auth/authorization'

/**
 * Higher-order function that wraps server function handlers to convert
 * auth errors into proper TanStack Router responses.
 *
 * Workaround for https://github.com/TanStack/router/issues/6381
 * where middleware cannot catch errors from handlers.
 *
 * @example
 * export const getGuideFn = createServerFn({ method: 'GET' })
 *   .middleware([requireAuthMiddleware])
 *   .inputValidator(schema)
 *   .handler(handleError(async ({ context, data }) => {
 *     await requireGuideAccess(data.guideId, context.user.id)
 *     return getGuide(data.guideId)
 *   }))
 */
export function handleError<TArgs, TResult>(
  handler: (args: TArgs) => Promise<TResult>,
): (args: TArgs) => Promise<TResult> {
  return async (args: TArgs): Promise<TResult> => {
    try {
      return await handler(args)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw notFound()
      }
      if (error instanceof ForbiddenError) {
        throw redirect({ to: '/' })
      }
      throw error
    }
  }
}
