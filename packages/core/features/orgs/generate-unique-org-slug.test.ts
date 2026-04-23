import { pickUniqueSlug } from './generate-unique-org-slug.server'

describe('pickUniqueSlug', () => {
  it('returns the slug as-is when no conflicts', () => {
    expect(pickUniqueSlug('museum-zurich', [])).toBe('museum-zurich')
  })

  it('returns the slug when taken slugs are unrelated', () => {
    expect(pickUniqueSlug('museum-zurich', ['some-other-org', 'another-org'])).toBe('museum-zurich')
  })

  it('appends -2 when the base slug is taken', () => {
    expect(pickUniqueSlug('my-studio', ['my-studio'])).toBe('my-studio-2')
  })

  it('appends next number after highest existing suffix', () => {
    expect(pickUniqueSlug('my-studio', ['my-studio', 'my-studio-2', 'my-studio-3'])).toBe('my-studio-4')
  })

  it('handles gaps in suffix numbers', () => {
    expect(pickUniqueSlug('my-studio', ['my-studio', 'my-studio-2', 'my-studio-5'])).toBe('my-studio-6')
  })

  it('ignores unrelated slugs that share a prefix', () => {
    expect(pickUniqueSlug('art', ['art', 'art-museum', 'art-gallery'])).toBe('art-2')
  })

  it('handles only suffixed variants without base slug', () => {
    // base slug "my-org" is free, but "my-org-2" exists — should return base
    expect(pickUniqueSlug('my-org', ['my-org-2'])).toBe('my-org')
  })

  it('appends -1 when base slug is reserved and nothing is taken', () => {
    expect(pickUniqueSlug('admin', [])).toBe('admin-1')
  })

  it('appends suffix when base slug is reserved even without DB conflicts', () => {
    expect(pickUniqueSlug('studio', [])).toBe('studio-1')
  })

  it('appends -2 when base slug is reserved and -1 is taken', () => {
    expect(pickUniqueSlug('admin', ['admin-1'])).toBe('admin-2')
  })

  it('handles large suffix numbers', () => {
    expect(pickUniqueSlug('org', ['org', 'org-99'])).toBe('org-100')
  })

  it('treats base slug as suffix 1 when computing max', () => {
    // "my-org" exists (counts as 1), so next is 2
    expect(pickUniqueSlug('my-org', ['my-org'])).toBe('my-org-2')
  })
})
