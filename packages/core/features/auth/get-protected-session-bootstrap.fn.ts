import { createServerFn } from '@tanstack/react-start'
import { getProtectedSessionBootstrap } from './get-protected-session-bootstrap.server'

export type {
  ActiveOrgSource,
  ProtectedSessionBootstrap,
  ProtectedSessionUser,
} from './get-protected-session-bootstrap.server'

export const getProtectedSessionBootstrapFn = createServerFn({ method: 'GET' }).handler(async () => {
  return getProtectedSessionBootstrap('protectedSessionBootstrap')
})
