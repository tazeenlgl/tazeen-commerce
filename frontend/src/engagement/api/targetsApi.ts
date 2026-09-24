// Local mock service. Replace the bodies with POS backend calls later;
// the exported surface (types + function signatures) is what the UI depends on.
import { MAX_TARGET_CS, MIN_TARGET_CS } from '../lib/centis'
import { todayIST } from '../lib/format'
import { seedTargets } from '../data/mockTargets'
import type { TargetItem, TargetsQuery, TargetsResponse } from '../types/target'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

const PAGE_SIZES = [25, 50, 100]
let store: TargetItem[] = seedTargets()

const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))
const validDate = (d: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= '2020-01-01' && d <= '2100-12-31'
const checkCs = (cs: number) => {
  if (!Number.isInteger(cs) || cs < MIN_TARGET_CS || cs > MAX_TARGET_CS)
    throw new ApiError(400, 'Winner time must be between 00:00.01 and 00:59.99.')
}

export const targetsApi = {
  async list(q: TargetsQuery): Promise<TargetsResponse> {
    await wait()
    const pageSize = PAGE_SIZES.includes(q.pageSize) ? q.pageSize : 50
    const page = Math.max(q.page, 1)
    const rows = store
      .filter((t) => (!q.dateFrom || t.date >= q.dateFrom) && (!q.dateTo || t.date <= q.dateTo))
      .sort((a, b) => b.date.localeCompare(a.date))
    const today = todayIST()
    return {
      today: { date: today, target: store.find((t) => t.date === today) ?? null },
      items: rows.slice((page - 1) * pageSize, page * pageSize),
      total: rows.length,
      page,
      page_size: pageSize,
      total_pages: rows.length ? Math.ceil(rows.length / pageSize) : 0,
    }
  },

  async create(date: string, cs: number): Promise<TargetItem> {
    await wait()
    if (!validDate(date)) throw new ApiError(400, 'Enter a valid date.')
    checkCs(cs)
    if (store.some((t) => t.date === date))
      throw new ApiError(409, 'A target already exists for that date.')
    const now = new Date().toISOString()
    const item: TargetItem = {
      date, target_centiseconds: cs, set_by: 'POS Admin', created_at: now, updated_at: now, attempts: 0,
    }
    store = [...store, item]
    return item
  },

  async update(date: string, cs: number): Promise<TargetItem> {
    await wait()
    checkCs(cs)
    const cur = store.find((t) => t.date === date)
    if (!cur) throw new ApiError(404, 'No target for that date.')
    const next = { ...cur, target_centiseconds: cs, set_by: 'POS Admin', updated_at: new Date().toISOString() }
    store = store.map((t) => (t.date === date ? next : t))
    return next
  },

  async remove(date: string): Promise<void> {
    await wait()
    if (!store.some((t) => t.date === date)) throw new ApiError(404, 'No target for that date.')
    store = store.filter((t) => t.date !== date)
  },
}
