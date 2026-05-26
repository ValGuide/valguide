import { isShortLinkRedirectable } from './redirectability'

describe('isShortLinkRedirectable', () => {
  it('allows active non-expired links', () => {
    expect(isShortLinkRedirectable({ status: 'active', archivedAt: null, expiresAt: null })).toBe(true)
  })

  it('blocks archived links', () => {
    expect(isShortLinkRedirectable({ status: 'archived', archivedAt: new Date(), expiresAt: null })).toBe(false)
  })

  it('blocks expired links', () => {
    expect(isShortLinkRedirectable({ status: 'active', archivedAt: null, expiresAt: new Date('2020-01-01') })).toBe(
      false,
    )
  })
})
