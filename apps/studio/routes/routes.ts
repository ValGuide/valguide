import { supportedLocales } from '@/i18n/i18n.config'

export const routes = {
  console: '/console',
  sales: '/sales',
  login: '/login',
  loginEmail: '/login/email',
}

export const loginRoutes = [routes.login, routes.loginEmail]

export const isLoginRoute = (pathname: string) => loginRoutes.includes(unlocalizedPathname(pathname))

// TODO: add regex match for sub-paths (e.g. /console/:id --> :id)
export const protectedRoutes = [routes.console]

export const internalRoutes = [routes.sales]

export const isProtectedRoute = (pathname: string) =>
  Object.values(protectedRoutes).includes(unlocalizedPathname(pathname))

export const isInternalRoute = (pathname: string) =>
  Object.values(internalRoutes).includes(unlocalizedPathname(pathname))

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

export const isRoute = (pathname: string, route: string | string[]) => {
  return Array.isArray(route) ? route.includes(unlocalizedPathname(pathname)) : route === unlocalizedPathname(pathname)
}
