// Local mock service; swap the body for a POS backend call later, keeping the signature.
import { seedAttempts } from '../data/mockAttempts'
import type { AttemptItem, AttemptsQuery, AttemptsResponse } from '../types/attempt'

const PAGE_SIZES = [25, 50, 100]
const store: AttemptItem[] = seedAttempts()
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export function matchesSearch(phone: string | null, customerId: string | null, search: string): boolean {
  const q = search.trim().toLowerCase()
  if (!q) return true
  const digits = q.replace(/\D/g, '')
  return (
    (customerId ?? '').toLowerCase().includes(q) ||
    (phone ?? '').toLowerCase().includes(q) ||
    (digits.length > 0 && (phone ?? '').replace(/\D/g, '').includes(digits))
  )
}

export const attemptsApi = {
  async list(q: AttemptsQuery): Promise<AttemptsResponse> {
    await wait()
    const pageSize = PAGE_SIZES.includes(q.pageSize) ? q.pageSize : 50
    const page = Math.max(q.page, 1)
    const rows = store.filter(
      (a) =>
        (!q.dateFrom || a.attempt_date >= q.dateFrom) &&
        (!q.dateTo || a.attempt_date <= q.dateTo) &&
        (q.result === '' || a.is_winner === (q.result === 'won')) &&
        (q.phone === '' || Boolean(a.phone) === (q.phone === 'available')) &&
        matchesSearch(a.phone, a.customer_id, q.search),
    )
    return {
      summary: {
        total_attempts: store.length,
        winning_attempts: store.filter((a) => a.is_winner).length,
        anonymous_attempts: store.filter((a) => a.customer_id === null).length,
      },
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      page_size: pageSize,
      total_pages: rows.length ? Math.ceil(rows.length / pageSize) : 0,
    }
  },

  /** Shared with the mock winners service so both views stay consistent. */
  _all: () => store,
}
