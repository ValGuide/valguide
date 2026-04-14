import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getThemeAiWorkspace } from './get-theme-ai-workspace.server'

export type { ThemeAiWorkspaceData, ThemeAiWorkspaceGeneration } from './theme-ai.shared'

export const getThemeAiWorkspaceFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(organizationId, context.user.id)
    return getThemeAiWorkspace(organizationId)
  })
