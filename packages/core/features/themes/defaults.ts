import type { ThemePreset } from './types'

/**
 * Default theme mapping for system light/dark modes.
 * Change these to switch the default themes across all apps.
 */
export const defaultThemes = {
  light: 'angle' as ThemePreset,
  dark: 'angle-dark' as ThemePreset,
} as const

/**
 * Resolves a theme value to an actual theme preset.
 * - 'system' resolves to defaultThemes.light (for SSR, actual resolution happens client-side)
 * - 'light' and 'dark' resolve to defaultThemes.light and defaultThemes.dark
 * - Other values are returned as-is
 */
export function resolveTheme(theme: string): ThemePreset {
  if (theme === 'system' || theme === 'light') {
    return defaultThemes.light
  }
  if (theme === 'dark') {
    return defaultThemes.dark
  }
  return theme as ThemePreset
}

/**
 * Generates an inline script to prevent FOUC (Flash of Unstyled Content)
 * by applying the theme before React hydrates.
 *
 * @param cookieName - The cookie name to read the theme preference from
 * @returns The inline script as a string
 */
export function generateThemeScript(cookieName: string): string {
  const lightTheme = defaultThemes.light
  const darkTheme = defaultThemes.dark

  return `(function(){var m=document.cookie.match(/${cookieName}=([^;]+)/),t=m?m[1]:'system',r;r=t==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'${darkTheme}':'${lightTheme}'):t;document.documentElement.setAttribute('data-theme',r)})()`.replace(
    /\n/g,
    '',
  )
}
