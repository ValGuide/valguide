import { createStart } from '@tanstack/react-start'
import { dbRequestMiddleware } from '@valguide/core/features/db-middleware'
import { createMaintenanceRequestMiddleware } from '@valguide/core/features/maintenance/maintenance-request-middleware'
import { errorCatchingMiddleware, globalErrorMiddleware } from '@valguide/core/utils/error-catching-middleware'

export const startInstance = createStart(() => ({
  defaultSsr: true,
  functionMiddleware: [errorCatchingMiddleware],
  requestMiddleware: [
    createMaintenanceRequestMiddleware({ app: 'studio' }),
    dbRequestMiddleware,
    globalErrorMiddleware,
  ],
}))
