export const REMOVE_MEMBER_ERROR = {
  notFound: 'ORG_REMOVE_MEMBER_NOT_FOUND',
  cannotRemoveSelf: 'ORG_REMOVE_MEMBER_SELF',
  adminCannotRemoveOwner: 'ORG_REMOVE_MEMBER_ADMIN_OWNER',
  lastOwner: 'ORG_REMOVE_MEMBER_LAST_OWNER',
} as const

export type RemoveMemberErrorCode = (typeof REMOVE_MEMBER_ERROR)[keyof typeof REMOVE_MEMBER_ERROR]
