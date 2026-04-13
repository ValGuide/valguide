import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { z } from 'zod'
import { captureStudioProductEvent } from '../../posthog/server'
import { requireOrgRole } from '../auth/authorization'
import { auth } from '../auth/better-auth.server'
import { requireAuthMiddleware } from '../auth/middleware'
import { db } from '../db'
import { REMOVE_MEMBER_ERROR } from './remove-member.errors'
import { countOtherOwners, getMemberForRemoval } from './remove-member.server'

const removeMemberSchema = z.object({
  memberId: z.string(),
  teamId: z.string(),
})

export const removeMemberFn = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(removeMemberSchema)
  .handler(async ({ context, data }) => {
    const authResult = await requireOrgRole(data.teamId, context.user.id, 'admin')
    const targetMember = await getMemberForRemoval(db, data.teamId, data.memberId)

    if (!targetMember) {
      throw new Error(REMOVE_MEMBER_ERROR.notFound)
    }

    if (targetMember.userId === context.user.id) {
      throw new Error(REMOVE_MEMBER_ERROR.cannotRemoveSelf)
    }

    if (authResult.role === 'admin' && targetMember.role === 'owner') {
      throw new Error(REMOVE_MEMBER_ERROR.adminCannotRemoveOwner)
    }

    if (targetMember.role === 'owner') {
      const otherOwnerCount = await countOtherOwners(db, data.teamId, targetMember.id)

      if (otherOwnerCount === 0) {
        throw new Error(REMOVE_MEMBER_ERROR.lastOwner)
      }
    }

    await auth.api.removeMember({
      headers: getRequestHeaders(),
      body: {
        organizationId: data.teamId,
        memberIdOrEmail: data.memberId,
      },
    })

    await captureStudioProductEvent({
      distinctId: context.user.id,
      event: 'org.member_removed',
      properties: {
        organization_id: data.teamId,
        member_id: data.memberId,
        removed_role: targetMember.role,
      },
    })
  })
