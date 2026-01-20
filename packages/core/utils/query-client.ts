import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isNotFound, isRedirect } from '@tanstack/react-router'
import { logError } from './log-error'

const shouldRetry = (failureCount: number, error: unknown): boolean => {
  if (isRedirect(error) || isNotFound(error)) {
    return false
  }
  const status = error instanceof Response ? error.status : (error as { status?: number })?.status
  if (status && [307, 403, 404].includes(status)) {
    return false
  }
  return failureCount < 3
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: {
        retry: shouldRetry,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        logError(error, { source: 'query', queryKey: query.queryKey })
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _, __, mutation) => {
        logError(error, { source: 'mutation', mutationKey: mutation.options.mutationKey })
      },
    }),
  })
}
