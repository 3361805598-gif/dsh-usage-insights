import { describe, expect, it } from 'vitest'
import { isTrustedRequest } from '../src/server/trust-fence.js'

describe('trust fence', () => {
  it('permits same-origin loopback and denies cross-site/browser host spoofing', () => {
    expect(isTrustedRequest({ headers: { host: '127.0.0.1:55231', origin: 'http://127.0.0.1:55231' } }, [])).toBe(true)
    expect(isTrustedRequest({ headers: { host: '127.0.0.1:55231', origin: 'https://evil.example' } }, [])).toBe(false)
    expect(isTrustedRequest({ headers: { host: 'evil.example' } }, [])).toBe(false)
    expect(isTrustedRequest({ headers: { host: 'localhost:55231', 'sec-fetch-site': 'cross-site' } }, [])).toBe(false)
  })
})
