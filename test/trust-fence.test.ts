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

it('rejects malformed authorities, ambiguous headers and non-web origins', () => {
  for (const host of ['evil@localhost', 'localhost/path', 'localhost?x=1', 'localhost#x', ' localhost']) {
    expect(isTrustedRequest({ headers: { host } }, [])).toBe(false)
  }
  for (const origin of ['ftp://localhost', 'http://user@localhost', 'http://localhost/path', 'null', ['http://localhost']]) {
    expect(isTrustedRequest({ headers: { host: 'localhost', origin: origin as string } }, [])).toBe(false)
  }
  expect(isTrustedRequest({ headers: { host: '[::1]:8080', origin: 'http://[::1]:8080' } }, [])).toBe(true)
  expect(isTrustedRequest({ headers: { host: 'dsh.local:8080', origin: 'http://dsh.local:8080' } }, ['dsh.local'])).toBe(true)
})
