// Local mock service; swap the bodies for POS backend calls later, keeping the signatures.
import { seedAudience } from '../data/mockAudience'
import type { AudienceDetail, AudienceQuery, AudienceResponse } from '../types/audience'

const PAGE_SIZES = [25, 50, 100]
const ACTIVE_DAYS = 7 // "active installation" window, same as the Game
const store: AudienceDetail[] = seedAudience()
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function matches(a: AudienceDetail, q: AudienceQuery): boolean {
  if (q.platform && a.platform !== q.platform) return false
  if (q.installed && a.installed !== (q.installed === 'yes')) return false
  if (q.permission && a.permission !== q.permission) return false
  if (q.push && a.push !== q.push) return false
  if (q.customer && (a.customer_id !== null) !== (q.customer === 'linked')) return false
  if (q.game === 'played' && a.attempts === 0) return false
  if (q.game === 'not_played' && a.attempts > 0) return false
  if (q.game === 'won' && a.wins === 0) return false
  const s = q.search.trim().toLowerCase()
  if (s) {
    const digits = s.replace(/\D/g, '')
    const hay = [a.id, a.customer_id, a.phone, a.ip, a.browser, a.platform].map((v) => (v ?? '').toLowerCase())
    const phoneDigits = (a.phone ?? '').replace(/\D/g, '')
    if (!hay.some((h) => h.includes(s)) && !(digits && phoneDigits.includes(digits))) return false
  }
  return true
}

export const audienceApi = {
  async list(q: AudienceQuery): Promise<AudienceResponse> {
    await wait()
    const pageSize = PAGE_SIZES.includes(q.pageSize) ? q.pageSize : 50
    const page = Math.max(q.page, 1)
    const rows = store.filter((a) => matches(a, q))
    const cutoff = Date.now() - ACTIVE_DAYS * 86400000
    const customers = (pred: (a: AudienceDetail) => boolean) =>
      new Set(store.filter((a) => a.customer_id && pred(a)).map((a) => a.customer_id)).size
    return {
      summary: {
        total_audience: store.length,
        active_installations: store.filter((a) => a.installed && Date.parse(a.last_seen_at) >= cutoff).length,
        push_subscribers: store.filter((a) => a.push === 'active').length,
        players: customers((a) => a.attempts > 0),
        winners: customers((a) => a.wins > 0),
        active_window_days: ACTIVE_DAYS,
      },
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      page_size: pageSize,
      total_pages: rows.length ? Math.ceil(rows.length / pageSize) : 0,
    }
  },

  async get(id: string): Promise<AudienceDetail> {
    await wait(150)
    const found = store.find((a) => a.id === id)
    if (!found) throw new Error('Audience member not found.')
    return found
  },
}
