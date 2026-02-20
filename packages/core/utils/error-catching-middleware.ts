import { notFound, redirect } from '@tanstack/react-router'
import { createMiddleware } from '@tanstack/react-start'
import { ForbiddenError, NotFoundError } from '@valguide/core/features/auth/authorization'

/**
 * Global function middleware that converts auth errors into proper TanStack Router responses.
 *
 * This middleware should be added to the `functionMiddleware` array in createStart()
 * to handle NotFoundError and ForbiddenError from server functions globally.
 *
 * - NotFoundError → throws notFound() (TanStack Router 404)
 * - ForbiddenError → throws redirect({ to: '/' })
 *
 * @example
 * import { errorCatchingMiddleware, globalErrorMiddleware } from '@valguide/core/utils/error-catching-middleware'
 *
 * export const startInstance = createStart(() => ({
 *   functionMiddleware: [errorCatchingMiddleware],
 *   requestMiddleware: [globalErrorMiddleware],
 * }))
 */
export const errorCatchingMiddleware = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof NotFoundError) {
      console.info('NotFoundError caught in errorCatchingMiddleware:', error)
      throw notFound()
    }
    if (error instanceof ForbiddenError) {
      console.info('ForbiddenError caught in errorCatchingMiddleware:', error)
      throw redirect({ to: '/' })
    }
    if (error instanceof Response) {
      throw error
    }
    console.error('Uncaught error in errorCatchingMiddleware:', error)
    throw error
  }
})

/**
 * Global request middleware that catches unhandled errors and returns a JSON error response.
 *
 * This middleware should be added to the `requestMiddleware` array in createStart()
 * to handle any errors that aren't caught by function middleware.
 */
export const globalErrorMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  try {
    return await next()
  } catch (e: unknown) {
    console.error('Global error middleware caught error:', e)
    const message = e instanceof Error ? e.message : 'Server Error'
    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    )
  }
})
