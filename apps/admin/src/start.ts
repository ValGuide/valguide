import { createStart } from '@tanstack/react-start'
import { dbRequestMiddleware } from '@valguide/core/features/db-middleware'
import { errorCatchingMiddleware, globalErrorMiddleware } from '@valguide/core/utils/error-catching-middleware'

export const startInstance = createStart(() => ({
  functionMiddleware: [errorCatchingMiddleware],
  requestMiddleware: [dbRequestMiddleware, globalErrorMiddleware],
}))
