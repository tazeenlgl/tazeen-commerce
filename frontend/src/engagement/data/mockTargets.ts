import { todayIST } from '../lib/format'
import type { TargetItem } from '../types/target'

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Placeholder data used until the POS backend exists. Today's target is left unset on purpose for offsets not listed. */
export function seedTargets(): TargetItem[] {
  const today = todayIST()
  const rows: Array<[number, number, number]> = [
    [0, 1050, 0],
    [-1, 987, 41],
    [-2, 1200, 38],
    [-3, 875, 52],
    [-5, 1500, 29],
    [-8, 1010, 44],
  ]
  return rows.map(([offset, cs, attempts]) => ({
    date: addDays(today, offset),
    target_centiseconds: cs,
    set_by: 'POS Admin',
    created_at: `${addDays(today, offset - 1)}T09:00:00Z`,
    updated_at: `${addDays(today, offset - 1)}T09:00:00Z`,
    attempts,
  }))
}
