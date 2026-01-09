// Mock for @tanstack/react-start/server
// Prevents TanStack Start server modules from being bundled into Storybook

export function getCookie(name: string): string | undefined {
  if (typeof document !== 'undefined') {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
  }
  return undefined
}

export function getCookies(): Record<string, string> {
  if (typeof document !== 'undefined') {
    return document.cookie.split(';').reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split('=')
        if (key) acc[key] = value ?? ''
        return acc
      },
      {} as Record<string, string>,
    )
  }
  return {}
}

export function setCookie(name: string, value: string, options?: { expires?: Date; path?: string }): void {
  if (typeof document !== 'undefined') {
    let cookie = `${name}=${value}`
    if (options?.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`
    }
    if (options?.path) {
      cookie += `; path=${options.path}`
    }
    document.cookie = cookie
  }
}

export function deleteCookie(name: string): void {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

export const getEvent = () => null
export const getRequestHeader = () => undefined
export const getWebRequest = () => null
export const setResponseStatus = () => {}
