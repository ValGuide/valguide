import { createMiddleware } from '@tanstack/react-start'
import { runWithRequestDb } from './db'

/**
 * Request middleware that scopes one DB connection to the entire HTTP request.
 * All `db` accesses within this request share a single postgres.js client.
 * Connection is lazily created on first use and closed after the response.
 *
 * Add to `requestMiddleware` in createStart() BEFORE globalErrorMiddleware.
 */
export const dbRequestMiddleware = createMiddleware({ type: 'request' }).server(async ({ next }) => {
  return runWithRequestDb(async () => await next())
})
