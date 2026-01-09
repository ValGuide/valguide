// Mock for @tanstack/react-start
// Prevents TanStack Start server modules from being bundled into Storybook

// Mock useServerFn - returns the function directly since in Storybook we use mocked server functions
export function useServerFn<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return fn
}

// Mock createServerFn - returns a builder that ultimately returns a callable function
export function createServerFn(options?: { method?: string }) {
  const fn = async () => null

  const builder = {
    inputValidator: () => builder,
    handler: (handlerFn: (...args: unknown[]) => unknown) => {
      // Return a function that mimics the server function signature
      const serverFn = async (args?: { data?: unknown }) => {
        return handlerFn({ data: args?.data })
      }
      return serverFn
    },
  }

  return builder
}

// Export other commonly used items
export const json = (data: unknown) => data
export const redirect = (url: string) => ({ redirect: url })
