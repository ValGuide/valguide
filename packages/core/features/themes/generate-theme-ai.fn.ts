import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { generateThemeAi } from './generate-theme-ai.server'
import { generateThemeAiInputSchema } from './theme-ai.shared'

export type { GenerateThemeAiInput, ThemeAiGeneratedTheme } from './theme-ai.shared'

export const generateThemeAiFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(generateThemeAiInputSchema)
  .handler(async ({ context, data }) => {
    const organizationId = context.activeOrgId
    if (!organizationId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(organizationId, context.user.id)
    return generateThemeAi(data, organizationId, context.user.id)
  })
