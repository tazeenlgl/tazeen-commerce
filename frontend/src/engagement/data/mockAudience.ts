
import { rng, seedAttempts, uuid } from './mockAttempts'
import type { AudienceDetail, Permission, PushStatus } from '../types/audience'

// Placeholder data until the POS backend exists. Customers and their game totals come from the
// same seeded attempts used by the Attempts/Winners mocks, so the three pages agree.
const PLATFORM_BY_OS: Record<string, string> = { Android: 'Android', iOS: 'iOS', iPadOS: 'iOS', Windows: 'Windows' }
const ANON_POOL = [
  { type: 'mobile', browser: 'Chrome', version: '126', platform: 'Android' },
  { type: 'mobile', browser: 'Safari', version: '17', platform: 'iOS' },
  { type: 'desktop', browser: 'Edge', version: '126', platform: 'Windows' },
  { type: 'desktop', browser: 'Chrome', version: '126', platform: 'macOS' },
  { type: 'mobile', browser: 'Firefox', version: '127', platform: 'Android' },
  { type: 'desktop', browser: 'Chrome', version: '125', platform: 'Linux' },
]

export function seedAudience(): AudienceDetail[] {
  const r = rng(77)
  const now = Date.now()
  const iso = (daysAgo: number) => new Date(now - daysAgo * 86400000 - Math.floor(r() * 43200000)).toISOString()

  const attempts = seedAttempts()
  const byCustomer = new Map<string, { phone: string | null; device: (typeof attempts)[number]['device']; n: number; wins: number; first: string; last: string }>()
  for (const a of attempts) {
    if (!a.customer_id) continue
    const c = byCustomer.get(a.customer_id)
    if (!c) byCustomer.set(a.customer_id, { phone: a.phone, device: a.device, n: 1, wins: a.is_winner ? 1 : 0, first: a.attempted_at, last: a.attempted_at })
    else {
      c.n++
      if (a.is_winner) c.wins++
      if (a.attempted_at < c.first) c.first = a.attempted_at
      if (a.attempted_at > c.last) c.last = a.attempted_at
    }
  }

  const rows: AudienceDetail[] = []
  const make = (
    customerId: string | null, phone: string | null,
    d: { type: string | null; browser: string | null; version: string | null; platform: string },
    stats: { n: number; wins: number; first: string; last: string } | null, deviceCount: number,
  ) => {
    const installed = r() < 0.6
    const p = r()
    const permission: Permission = p < 0.55 ? 'granted' : p < 0.7 ? 'denied' : 'default'
    const hasSub = permission === 'granted' ? r() < 0.9 : r() < 0.15
    const subActive = hasSub && r() < 0.85
    const push: PushStatus = permission === 'granted' && subActive ? 'active' : hasSub ? 'inactive' : 'none'
    const lastSeenDays = r() < 0.7 ? r() * 6 : 7 + r() * 25
    rows.push({
      id: uuid(r),
      customer_id: customerId,
      phone,
      platform: d.platform,
      browser: d.browser,
      browser_version: d.version,
      device_type: d.type,
      installed,
      permission,
      push,
      first_seen_at: iso(lastSeenDays + 5 + r() * 20),
      last_seen_at: iso(lastSeenDays),
      attempts: stats?.n ?? 0,
      wins: stats?.wins ?? 0,
      ip: r() < 0.9 ? `49.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}.${Math.floor(r() * 255)}` : null,
      installed_at: installed ? iso(lastSeenDays + 2) : null,
      device_count: deviceCount,
      first_played: stats?.first ?? null,
      last_played: stats?.last ?? null,
      push_last_success_at: hasSub && r() < 0.8 ? iso(r() * 5) : null,
      push_last_failure_at: hasSub && r() < 0.25 ? iso(r() * 10) : null,
    })
  }

  let i = 0
  for (const [id, c] of byCustomer) {
    const os = (c.device?.os ?? 'Android').split(' ')[0]
    const [browser, version] = (c.device?.browser ?? 'Chrome 126').split(' ')
    const base = { type: c.device?.type ?? 'mobile', browser, version: version ?? null, platform: PLATFORM_BY_OS[os] ?? 'Unknown' }
    const devices = i++ % 4 === 0 ? 2 : 1
    for (let k = 0; k < devices; k++) make(id, c.phone, base, c, devices)
  }
  // Anonymous devices: no customer, therefore no phone and no game history.
  for (let k = 0; k < 12; k++) make(null, null, { ...ANON_POOL[k % ANON_POOL.length], type: ANON_POOL[k % ANON_POOL.length].type }, null, 1)

  return rows.sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at))
}
