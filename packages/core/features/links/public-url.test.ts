import { buildShortLinkUrl } from './public-url'

describe('public-url', () => {
  it('builds short link URLs without double slashes', () => {
    expect(buildShortLinkUrl('https://links.valguide.dev/', 'abc123')).toBe('https://links.valguide.dev/s/abc123')
  })

  it('preserves base URLs without a trailing slash', () => {
    expect(buildShortLinkUrl('https://links.valguide.com', 'xyz789')).toBe('https://links.valguide.com/s/xyz789')
  })
})
