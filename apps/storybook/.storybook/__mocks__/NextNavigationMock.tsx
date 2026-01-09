import * as React from 'react'

export const useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
})

export const usePathname = () => '/'

export const useSearchParams = () => new URLSearchParams()

export const useParams = () => ({})

export const useSelectedLayoutSegment = () => null

export const useSelectedLayoutSegments = () => []

export const redirect = (_url: string) => {}

export const notFound = () => {}

export const ServerInsertedHTMLContext = React.createContext<((content: React.ReactNode) => void) | null>(null)

export const useServerInsertedHTML = () => {}

export default {
  useRouter,
  usePathname,
  useSearchParams,
  useParams,
  useSelectedLayoutSegment,
  useSelectedLayoutSegments,
  redirect,
  notFound,
  ServerInsertedHTMLContext,
  useServerInsertedHTML,
}
