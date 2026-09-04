import type { IncomingHttpHeaders } from 'node:http'

function one(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name]
  return typeof value === 'string' ? value : undefined
}

function authority(value: string): URL | undefined {
  try { return new URL(`http://${value}`) } catch { return undefined }
}

function loopback(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (host === 'localhost' || host === '::1') return true
  const parts = host.split('.')
  return parts.length === 4 && parts[0] === '127' && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
}

/** Reject browser requests that do not originate from DSH's trusted local UI. */
export function isTrustedRequest(request: { headers: IncomingHttpHeaders }, trustedHosts: readonly string[]): boolean {
  const host = one(request.headers, 'host')
  const hostUrl = host ? authority(host) : undefined
  if (!hostUrl) return false
  const trusted = trustedHosts.some((candidate) => {
    const allowed = authority(candidate)
    return allowed && (allowed.port === '' ? allowed.hostname === hostUrl.hostname : allowed.host === hostUrl.host)
  })
  if (!loopback(hostUrl.hostname) && !trusted) return false
  if (one(request.headers, 'sec-fetch-site') === 'cross-site') return false
  const origin = one(request.headers, 'origin')
  if (!origin) return true
  try { return new URL(origin).host === hostUrl.host } catch { return false }
}
