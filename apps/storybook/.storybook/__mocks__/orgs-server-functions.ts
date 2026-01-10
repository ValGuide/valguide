// Mock for @valguide/core/features/orgs/server-functions

export const createTeamFn = async () => ({
  id: 'mock-team-id',
  name: 'Mock Team',
  slug: 'mock-team',
})

export const inviteMemberFn = async () => {}

export const resendInviteFn = async () => {}

export const cancelInviteFn = async () => {}

export const removeMemberFn = async () => {}

export const updateMemberRoleFn = async () => {}

export const joinTeamFn = async () => ({
  success: true,
  slug: 'mock-team',
})

export const switchTeamFn = async () => ({
  success: true,
})
