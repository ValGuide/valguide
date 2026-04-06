export function drizzle() {
  return new Proxy(
    {},
    {
      get() {
        return () => undefined
      },
    },
  )
}
