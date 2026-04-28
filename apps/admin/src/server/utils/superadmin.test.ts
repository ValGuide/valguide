import { isAdminEmailAllowed } from './superadmin'

describe('isAdminEmailAllowed', () => {
  it('allows emails from ADMIN_ALLOWED_EMAILS case-insensitively', () => {
    expect(isAdminEmailAllowed('Admin@Example.com', 'admin@example.com, owner@example.com')).toBe(true)
  })

  it('denies emails outside ADMIN_ALLOWED_EMAILS', () => {
    expect(isAdminEmailAllowed('editor@example.com', 'admin@example.com')).toBe(false)
  })

  it('denies missing emails', () => {
    expect(isAdminEmailAllowed(undefined, 'admin@example.com')).toBe(false)
  })
})
