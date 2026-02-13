import { createStart } from '@tanstack/react-start'
import { errorCatchingMiddleware, globalErrorMiddleware } from '@valguide/core/utils/error-catching-middleware'
import { adminMiddleware } from './server/middleware'

export const startInstance = createStart(() => ({
  functionMiddleware: [errorCatchingMiddleware, adminMiddleware],
  requestMiddleware: [globalErrorMiddleware],
}))
