import { db } from '@valguide/core/features/db'
import { and, eq } from 'drizzle-orm'
import { asset } from '../assets/schema'
import { member, type OrgRole } from '../orgs/schema'
import { theme } from '../themes/schema'
import { stop, tour } from '../tours/schema'
import { isRoleAtLeast, parseOrgRole } from './organization-permissions'

// ============================================================================
// Error Classes
// ============================================================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND',
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export class UnauthenticatedError extends AuthError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHENTICATED')
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'You do not have access to this resource') {
    super(message, 'FORBIDDEN')
  }
}

export class NotFoundError extends AuthError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND')
  }
}

// ============================================================================
// Types
// ============================================================================

export type AuthUser = {
  id: string
  email?: string
}

export type AuthResult = AuthUser & { role: OrgRole; organizationId: string }

// ============================================================================
// Core Auth Functions
// ============================================================================

/**
 * Get user's membership in an organization, or null if not a member.
 */
export async function getOrgMembership(userId: string, organizationId: string): Promise<{ role: OrgRole } | null> {
  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)

  const role = membership?.role ? parseOrgRole(membership.role) : null
  if (!role) {
    return null
  }

  return { role }
}

/**
 * Require user to be a member of an organization.
 * Throws ForbiddenError if not a member.
 */
export async function requireOrgMember(organizationId: string, userId: string): Promise<AuthResult> {
  const membership = await getOrgMembership(userId, organizationId)

  if (!membership) {
    throw new ForbiddenError()
  }

  return {
    id: userId,
    role: membership.role,
    organizationId,
  }
}

/**
 * Require user to have a minimum role in an organization.
 * Throws ForbiddenError if not a member or insufficient role.
 */
export async function requireOrgRole(organizationId: string, userId: string, minRole: OrgRole): Promise<AuthResult> {
  const result = await requireOrgMember(organizationId, userId)

  if (!isRoleAtLeast(result.role, minRole)) {
    throw new ForbiddenError(`Requires ${minRole} role or higher`)
  }

  return result
}

// ============================================================================
// Entity Access - Tour
// ============================================================================

/**
 * Require access to a tour by its UUID.
 */
export async function requireTourAccess(tourId: string, userId: string): Promise<AuthResult> {
  const [foundTour] = await db
    .select({ organizationId: tour.organizationId })
    .from(tour)
    .where(eq(tour.id, tourId))
    .limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  return requireOrgMember(foundTour.organizationId, userId)
}

/**
 * Require access to a tour by its nanoId.
 */
export async function requireTourAccessByNanoId(
  nanoId: string,
  userId: string,
): Promise<AuthResult & { tourId: string }> {
  const [foundTour] = await db
    .select({ id: tour.id, organizationId: tour.organizationId })
    .from(tour)
    .where(eq(tour.nanoId, nanoId))
    .limit(1)

  if (!foundTour) {
    throw new NotFoundError('Tour')
  }

  const result = await requireOrgMember(foundTour.organizationId, userId)
  return { ...result, tourId: foundTour.id }
}

// ============================================================================
// Entity Access - Stop
// ============================================================================

/**
 * Require access to a stop by its UUID.
 */
export async function requireStopAccess(stopId: string, userId: string): Promise<AuthResult> {
  const [foundStop] = await db
    .select({ organizationId: stop.organizationId })
    .from(stop)
    .where(eq(stop.id, stopId))
    .limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  return requireOrgMember(foundStop.organizationId, userId)
}

/**
 * Require access to a stop by its nanoId.
 */
export async function requireStopAccessByNanoId(
  nanoId: string,
  userId: string,
): Promise<AuthResult & { stopId: string }> {
  const [foundStop] = await db
    .select({ id: stop.id, organizationId: stop.organizationId })
    .from(stop)
    .where(eq(stop.nanoId, nanoId))
    .limit(1)

  if (!foundStop) {
    throw new NotFoundError('Stop')
  }

  const result = await requireOrgMember(foundStop.organizationId, userId)
  return { ...result, stopId: foundStop.id }
}

// ============================================================================
// Entity Access - Asset
// ============================================================================

/**
 * Require access to an asset by its UUID.
 */
export async function requireAssetAccess(assetId: string, userId: string): Promise<AuthResult> {
  const [foundAsset] = await db
    .select({ organizationId: asset.organizationId })
    .from(asset)
    .where(eq(asset.id, assetId))
    .limit(1)

  if (!foundAsset) {
    throw new NotFoundError('Asset')
  }

  if (!foundAsset.organizationId) {
    throw new ForbiddenError('Asset has no organization')
  }

  return requireOrgMember(foundAsset.organizationId, userId)
}

// ============================================================================
// Entity Access - Theme
// ============================================================================

/**
 * Require access to a theme by its UUID.
 */
export async function requireThemeAccess(themeId: string, userId: string): Promise<AuthResult> {
  const [foundTheme] = await db
    .select({ organizationId: theme.organizationId })
    .from(theme)
    .where(eq(theme.id, themeId))
    .limit(1)

  if (!foundTheme) {
    throw new NotFoundError('Theme')
  }

  return requireOrgMember(foundTheme.organizationId, userId)
}
