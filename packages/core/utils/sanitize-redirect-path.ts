/**
 * Sanitizes a redirect path to prevent open redirect attacks.
 *
 * Only allows relative paths (starting with `/`).
 * Blocks absolute URLs (`https://evil.com`), protocol-relative URLs (`//evil.com`),
 * and other schemes (`javascript:`, `data:`, etc.).
 *
 * @param path - The redirect path to sanitize
 * @param fallback - Fallback path if the input is unsafe (defaults to `/`)
 * @returns A safe relative path
 */
export function sanitizeRedirectPath(path: string, fallback = '/'): string {
  // Must start with exactly one `/` followed by a non-`/` char (or end of string)
  // This blocks `//evil.com`, `https://evil.com`, `javascript:`, etc.
  if (/^\/(?:[^/]|$)/.test(path)) {
    return path
  }
  return fallback
}
