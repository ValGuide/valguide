/**
 * Platform-agnostic waitUntil — extends request lifetime for background work.
 * Uses Vercel's waitUntil on Vercel, Cloudflare's ctx.waitUntil on Workers.
 * Falls back to fire-and-forget if neither platform is detected.
 */
export function waitUntil(promise: Promise<unknown>): void {
  _doWaitUntil(promise).catch(() => {
    promise.catch(console.error)
  })
}

async function _doWaitUntil(promise: Promise<unknown>): Promise<void> {
  if (process.env.VERCEL) {
    const { waitUntil: fn } = await import('@vercel/functions')
    fn(promise)
    return
  }
  // @ts-expect-error — cloudflare:workers is a Cloudflare Workers built-in module
  const { ctx } = await import(/* @vite-ignore */ 'cloudflare:workers')
  ctx.waitUntil(promise)
}
