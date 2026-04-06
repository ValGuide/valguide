import { resolveTourLocaleState } from './tour-locale-state'

describe('resolveTourLocaleState', () => {
  it('prompts for confirmation when the locale is derived and supported', () => {
    expect(
      resolveTourLocaleState({
        currentLocale: 'de',
        hasLocaleCookie: false,
        availableLocales: ['de', 'en'],
      }),
    ).toEqual({
      currentLocale: 'de',
      availableLocales: ['de', 'en'],
      hasLocaleCookie: false,
      isCurrentLocaleSupported: true,
      shouldForceSelection: false,
      shouldPromptInitialSelection: true,
      preferredSelectionLocale: 'de',
    })
  })

  it('forces reselection when the cookie locale is unsupported by the tour', () => {
    expect(
      resolveTourLocaleState({
        currentLocale: 'rm',
        hasLocaleCookie: true,
        availableLocales: ['de', 'en'],
      }),
    ).toEqual({
      currentLocale: 'rm',
      availableLocales: ['de', 'en'],
      hasLocaleCookie: true,
      isCurrentLocaleSupported: false,
      shouldForceSelection: true,
      shouldPromptInitialSelection: false,
      preferredSelectionLocale: 'de',
    })
  })
})
