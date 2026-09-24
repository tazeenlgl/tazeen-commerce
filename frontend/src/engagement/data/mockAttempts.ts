import { addDays, todayIST } from '../lib/format'
import type { AttemptItem, DeviceInfo } from '../types/attempt'

// Placeholder data until the POS backend exists. Deterministic (seeded) so reloads look the same.
export function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export const hex = (r: () => number, n: number) =>
  Array.from({ length: n }, () => Math.floor(r() * 16).toString(16)).join('')
export const uuid = (r: () => number) =>
  `${hex(r, 8)}-${hex(r, 4)}-4${hex(r, 3)}-a${hex(r, 3)}-${hex(r, 12)}`

const DEVICES: DeviceInfo[] = [
  { type: 'mobile', browser: 'Chrome 126', os: 'Android 14' },
  { type: 'mobile', browser: 'Safari 17', os: 'iOS 17' },
  { type: 'mobile', browser: 'Chrome 125', os: 'Android 13' },
  { type: 'desktop', browser: 'Chrome 126', os: 'Windows 11' },
  { type: 'tablet', browser: 'Safari 17', os: 'iPadOS 17' },
]

// [day offset from today, target centiseconds] — same values as the mock Targets.
const DAYS: Array<[number, number]> = [[0, 1050], [-1, 987], [-2, 1200], [-3, 875], [-5, 1500], [-8, 1010]]

export function seedAttempts(): AttemptItem[] {
  const r = rng(20260921)
  const today = todayIST()

  const players = Array.from({ length: 14 }, (_, i) => ({
    id: uuid(r),
    // Two players never gave a phone.
    phone: i < 12 ? `+91${9000000000 + Math.floor(r() * 999999999)}` : null,
    device: DEVICES[i % DEVICES.length],
  }))

  const out: AttemptItem[] = []
  for (const [offset, target] of DAYS) {
    const date = addDays(today, offset)
    const count = 14 + Math.floor(r() * 8)
    // Exact matches are rare; give some days one winner and some none.
    const winnerSlot = offset % 2 === 0 ? Math.floor(r() * count) : -1
    for (let i = 0; i < count; i++) {
      const actual = i === winnerSlot ? target : Math.max(1, target + Math.round((r() - 0.5) * 600) || target + 1)
      const anonymous = r() < 0.06
      const p = players[Math.floor(r() * players.length)]
      // Today's attempts must not be in the future (IST).
      const istMinutesNow = Math.floor(((Date.now() + 5.5 * 3600000) % 86400000) / 60000)
      const minutes = Math.floor(r() * (offset === 0 ? Math.max(1, istMinutesNow) : 24 * 60))
      const at = new Date(`${date}T00:00:00+05:30`)
      at.setMinutes(at.getMinutes() + minutes)
      out.push({
        id: uuid(r),
        attempted_at: at.toISOString(),
        attempt_date: date,
        customer_id: anonymous ? null : p.id,
        phone: anonymous ? null : p.phone,
        device: anonymous && r() < 0.5 ? null : p.device,
        target_centiseconds: target,
        actual_centiseconds: actual,
        difference_centiseconds: actual - target,
        is_winner: actual === target, // exact-match rule, same as game.py
      })
    }
  }
  return out.sort((a, b) => b.attempted_at.localeCompare(a.attempted_at))
}
