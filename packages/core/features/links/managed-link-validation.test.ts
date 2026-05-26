import { normalizeExternalUrl, parseOptionalExpiry } from './managed-link-validation'

describe('managed-link-validation', () => {
  it('normalizes safe https URLs and strips fragments', () => {
    expect(normalizeExternalUrl(' https://museum.example/path?ref=qr#heading ')).toBe(
      'https://museum.example/path?ref=qr',
    )
  })

  it('rejects non-https URLs', () => {
    expect(() => normalizeExternalUrl('http://museum.example')).toThrow('https://')
    expect(() => normalizeExternalUrl('javascript:alert(1)')).toThrow('https://')
  })

  it('rejects local and private network URLs', () => {
    expect(() => normalizeExternalUrl('https://localhost/path')).toThrow('Local hostnames')
    expect(() => normalizeExternalUrl('https://192.168.1.5/path')).toThrow('Private network')
    expect(() => normalizeExternalUrl('https://museum.local/path')).toThrow('Local hostnames')
  })

  it('parses optional expiry values', () => {
    expect(parseOptionalExpiry(null)).toBeNull()
    expect(parseOptionalExpiry('2026-06-01')?.toISOString()).toContain('2026-06-01')
  })
})
