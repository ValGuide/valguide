import { createServerFn } from '@tanstack/react-start'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import { getBrandThemeSettings } from './get-brand-theme-settings.server'

export type { BrandThemeSettings, Theme } from './get-brand-theme-settings.server'

export const getBrandThemeSettingsFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const orgId = context.activeOrgId
    if (!orgId) {
      throw new Error('No active organization')
    }

    await requireOrgMember(orgId, context.user.id)
    return getBrandThemeSettings(orgId, context.user.id)
  })
