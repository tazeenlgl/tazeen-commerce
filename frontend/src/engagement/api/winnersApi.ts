import { deriveWinners } from '../data/mockWinners'
import { todayIST } from '../lib/format'
import type { WinnersQuery, WinnersResponse } from '../types/winner'
import { attemptsApi, matchesSearch } from './attemptsApi'

const PAGE_SIZES = [25, 50, 100]
const store = deriveWinners(attemptsApi._all())
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const winnersApi = {
  async list(q: WinnersQuery): Promise<WinnersResponse> {
    await wait()
    const pageSize = PAGE_SIZES.includes(q.pageSize) ? q.pageSize : 50
    const page = Math.max(q.page, 1)
    const today = todayIST()
    const rows = store
      .filter(
        (w) =>
          (!q.dateFrom || w.winner_date >= q.dateFrom) &&
          (!q.dateTo || w.winner_date <= q.dateTo) &&
          matchesSearch(w.phone, w.customer_id, q.search),
      )
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return {
      summary: {
        total_winners: store.length,
        today_winners: store.filter((w) => w.winner_date === today).length,
      },
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      page_size: pageSize,
      total_pages: rows.length ? Math.ceil(rows.length / pageSize) : 0,
    }
  },
}
