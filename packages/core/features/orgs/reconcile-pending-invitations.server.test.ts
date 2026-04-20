import { resolvePreferredActiveOrganizationId } from './resolve-preferred-active-organization-id'

describe('resolvePreferredActiveOrganizationId', () => {
  it('prefers the oldest invite organization when it was accepted', () => {
    expect(resolvePreferredActiveOrganizationId('org-oldest', new Set(['org-oldest', 'org-newer']))).toBe('org-oldest')
  })

  it('falls back to the first accepted organization when the preferred one was not accepted', () => {
    expect(resolvePreferredActiveOrganizationId('org-oldest', new Set(['org-newer']))).toBe('org-newer')
  })

  it('returns null when no organizations were accepted', () => {
    expect(resolvePreferredActiveOrganizationId('org-oldest', new Set())).toBeNull()
  })
})
