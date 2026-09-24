import type { DeviceInfo } from './attempt'

// game_winners (+ its attempt). One winner per attempt (attempt_id is unique).
export interface WinnerItem {
  id: string
  attempt_id: string
  customer_id: string | null
  phone: string | null
  winner_date: string
  target_centiseconds: number
  actual_centiseconds: number // always equals target_centiseconds (exact match)
  attempted_at: string
  device: DeviceInfo | null
  reward_name: string | null
  reward_status: string // 'pending' is the only value the Game writes; others UNKNOWN
  claimed_at: string | null
  created_at: string
}

export interface WinnersQuery {
  page: number
  pageSize: number
  search: string
  dateFrom: string
  dateTo: string
}

export interface WinnersResponse {
  summary: { total_winners: number; today_winners: number }
  items: WinnerItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
