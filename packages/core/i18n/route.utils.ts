import { supportedLocales } from './i18n.config'

const exctractPath = (url: string) => {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

const localesRegex = `(${supportedLocales.join('|')})`

export const unlocalizedPathname = (pathname: string) =>
  exctractPath(pathname)
    .replace(new RegExp(`^/${localesRegex}/`), '/')
    .replace(new RegExp(`^/${localesRegex}$`), '/')

export const withLeadingSlash = (str: string) => (str.startsWith('/') ? str : `/${str}`)
