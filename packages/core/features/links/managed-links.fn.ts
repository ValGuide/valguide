import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireOrgMember } from '../auth/authorization'
import { requireAuthMiddleware } from '../auth/middleware'
import {
  archiveManagedLink,
  createManagedLink,
  listManagedLinks,
  type ManagedLinkListItem,
  updateManagedLink,
} from './managed-links.server'

const destinationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('tour'),
    tourNanoId: z.string(),
  }),
  z.object({
    type: z.literal('stop'),
    tourNanoId: z.string(),
    stopNanoId: z.string(),
  }),
  z.object({
    type: z.literal('campaign'),
    campaignId: z.string(),
  }),
  z.object({
    type: z.literal('external'),
    externalUrl: z.string(),
  }),
  z.object({
    type: z.literal('landing_page'),
    pageSlug: z.string(),
    locale: z.string(),
  }),
])

const managedLinkMutationSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  destination: destinationSchema,
})

async function requireActiveOrganization(context: { activeOrgId: string | null; user: { id: string } }) {
  const organizationId = context.activeOrgId
  if (!organizationId) {
    throw new Error('No active organization')
  }
  await requireOrgMember(organizationId, context.user.id)
  return organizationId
}

export type { ManagedLinkDestination, ManagedLinkListItem, ManagedLinkMutationInput } from './managed-links.server'

export const listManagedLinksFn = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ includeArchived: z.boolean().optional() }).optional())
  .handler(async ({ context, data }): Promise<ManagedLinkListItem[]> => {
    const organizationId = await requireActiveOrganization(context)
    return listManagedLinks(organizationId, data ?? {})
  })

export const createManagedLinkFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(managedLinkMutationSchema)
  .handler(async ({ context, data }): Promise<ManagedLinkListItem> => {
    const organizationId = await requireActiveOrganization(context)
    return createManagedLink(organizationId, context.user.id, data)
  })

export const updateManagedLinkFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ id: z.number().int().positive(), values: managedLinkMutationSchema }))
  .handler(async ({ context, data }): Promise<ManagedLinkListItem> => {
    const organizationId = await requireActiveOrganization(context)
    return updateManagedLink(organizationId, context.user.id, data.id, data.values)
  })

export const archiveManagedLinkFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(z.object({ id: z.number().int().positive() }))
  .handler(async ({ context, data }): Promise<ManagedLinkListItem> => {
    const organizationId = await requireActiveOrganization(context)
    return archiveManagedLink(organizationId, context.user.id, data.id)
  })
