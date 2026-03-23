import { logPerformance, timePerformance } from '../../utils/performance'
import { resolveFirstOrgId } from '../orgs/resolve-active-org.server'
import { getAuthSession, setActiveOrganizationForCurrentSession } from './better-auth.server'
import { getUserStatus, type UserStatus } from './get-user-status.server'

export type ProtectedSessionUser = {
  id: string
  email?: string
}

export type ActiveOrgSource = 'session' | 'resolved' | 'missing'

export type ProtectedSessionBootstrap = {
  user: ProtectedSessionUser | null
  status: UserStatus | null
  activeOrgId: string | null
  activeOrgSource: ActiveOrgSource
}

export async function getProtectedSessionBootstrap(stage: string): Promise<ProtectedSessionBootstrap> {
  const session = await timePerformance('auth.getAuthSession', async () => getAuthSession(), {
    stage,
  })

  const user: ProtectedSessionUser | null = session?.user?.id
    ? {
        id: session.user.id,
        email: session.user.email,
      }
    : null

  if (!user) {
    return {
      user: null,
      status: null,
      activeOrgId: null,
      activeOrgSource: 'missing',
    }
  }

  const status = await timePerformance('auth.getUserStatus', async () => getUserStatus(user.id, user.email), {
    stage,
    userId: user.id,
  })

  if (status !== 'approved') {
    return {
      user,
      status,
      activeOrgId: null,
      activeOrgSource: 'missing',
    }
  }

  let activeOrgId =
    (session?.session as { activeOrganizationId?: string | null } | undefined)?.activeOrganizationId ?? null
  let activeOrgSource: ActiveOrgSource = activeOrgId ? 'session' : 'missing'

  if (!activeOrgId) {
    activeOrgId = await timePerformance('auth.resolveFirstOrgId', async () => resolveFirstOrgId(user.id), {
      stage,
      userId: user.id,
    })

    if (activeOrgId) {
      activeOrgSource = 'resolved'
      await setActiveOrganizationForCurrentSession(activeOrgId)
    }
  }

  logPerformance('auth.activeOrgId', {
    stage,
    userId: user.id,
    source: activeOrgSource,
    hasActiveOrgId: !!activeOrgId,
  })

  return {
    user,
    status,
    activeOrgId,
    activeOrgSource,
  }
}
