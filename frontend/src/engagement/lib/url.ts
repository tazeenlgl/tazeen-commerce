import { CAMPAIGN_LIMITS } from '../types/campaign'

/** Same rules as the Game ("/path" or https://…), but rejects "//host", "/\host" and control characters. */
export function validateDestination(value: string): string | null {
  const dest = value.trim() || '/'
  const message = 'Use a path like /game or a full https:// link.'
  if (dest.length > CAMPAIGN_LIMITS.url) return `Keep the link under ${CAMPAIGN_LIMITS.url} characters.`
  if ([...dest].some((c) => c.charCodeAt(0) <= 0x20 || c.charCodeAt(0) === 0x7f)) return message
  if (dest.startsWith('/')) return dest.startsWith('//') || dest.startsWith('/\\') ? message : null
  if (!/^https:\/\//i.test(dest)) return message
  try {
    return new URL(dest).hostname ? null : message
  } catch {
    return message
  }
}
