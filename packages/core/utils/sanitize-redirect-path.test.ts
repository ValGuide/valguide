import { sanitizeRedirectPath } from './sanitize-redirect-path'

describe('sanitizeRedirectPath', () => {
  it('allows simple relative paths', () => {
    expect(sanitizeRedirectPath('/tours')).toBe('/tours')
    expect(sanitizeRedirectPath('/tours/abc123')).toBe('/tours/abc123')
    expect(sanitizeRedirectPath('/stops/xyz?locale=de')).toBe('/stops/xyz?locale=de')
    expect(sanitizeRedirectPath('/')).toBe('/')
  })

  it('blocks protocol-relative URLs (//evil.com)', () => {
    expect(sanitizeRedirectPath('//evil.com')).toBe('/')
    expect(sanitizeRedirectPath('//evil.com/path')).toBe('/')
  })

  it('blocks absolute URLs', () => {
    expect(sanitizeRedirectPath('https://evil.com')).toBe('/')
    expect(sanitizeRedirectPath('http://evil.com')).toBe('/')
    expect(sanitizeRedirectPath('https://evil.com/login')).toBe('/')
  })

  it('blocks javascript: and data: schemes', () => {
    expect(sanitizeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(sanitizeRedirectPath('data:text/html,<h1>hi</h1>')).toBe('/')
  })

  it('blocks empty and bare strings', () => {
    expect(sanitizeRedirectPath('')).toBe('/')
    expect(sanitizeRedirectPath('evil.com')).toBe('/')
    expect(sanitizeRedirectPath('tours')).toBe('/')
  })

  it('uses custom fallback', () => {
    expect(sanitizeRedirectPath('https://evil.com', '/home')).toBe('/home')
  })
})
