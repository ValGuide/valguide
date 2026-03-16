import { getLocaleDisplayName, getLocaleNativeName, getLocalePresentation } from './locale-display-names'

describe('locale-display-names', () => {
  it('uses the explicit Romansh native override', () => {
    expect(getLocaleNativeName('rm')).toBe('Romontsch')
  })

  it('keeps the English display name fallback for Romansh', () => {
    expect(getLocaleDisplayName('rm', 'en')).toBe('Romansh')
  })

  it('returns presentation data with the native override', () => {
    expect(getLocalePresentation('rm', 'de')).toEqual({
      localeCode: 'rm',
      localizedName: 'Rätoromanisch',
      nativeName: 'Romontsch',
    })
  })
})
