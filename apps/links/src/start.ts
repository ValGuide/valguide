import { createMiddleware, createStart } from '@tanstack/react-start'

const globalErrorMiddleware = createMiddleware({
  type: 'request',
}).server(async ({ next }) => {
  try {
    return await next({
      context: {
        globalMiddlewareExecuted: true,
      },
    })
  } catch (e: unknown) {
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

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [globalErrorMiddleware],
}))
