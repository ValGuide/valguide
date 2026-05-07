import { createStart } from '@tanstack/react-start'
import { docsPasswordAuthMiddleware } from './lib/password-auth'

export const startInstance = createStart(() => ({
  requestMiddleware: [docsPasswordAuthMiddleware],
}))
