import { supabaseMiddlewareFn } from '@valguide/core/supabase/middleware'

export const middleware = supabaseMiddlewareFn({
  routes: [],
})

// Read more: https://next-auth.js.org/tutorials/securing-pages-and-api-routes
export const config = {
  // match anything that doesn't have a file extension
  // e.g. not *.js, *.json, *.png etc.
  // this basically matches all ours paths and ignores all _next resources
  matcher: ['/((?!api|monitoring|ingest|_next/image|auth/callback|.*\\.[^/]+$).+)', '/'],
}
