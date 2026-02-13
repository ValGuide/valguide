import { createStart } from '@tanstack/react-start'
import { errorCatchingMiddleware, globalErrorMiddleware } from '@valguide/core/utils/error-catching-middleware'

export const startInstance = createStart(() => ({
  functionMiddleware: [errorCatchingMiddleware],
  requestMiddleware: [globalErrorMiddleware],
}))
