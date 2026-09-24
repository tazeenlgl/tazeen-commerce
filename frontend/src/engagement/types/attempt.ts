export interface DeviceInfo {
  type: string | null
  browser: string | null
  os: string | null
}

// game_attempts (+ customer_devices). customer/device are nullable in the Game schema.
export interface AttemptItem {
  id: string
  attempted_at: string
  attempt_date: string
  customer_id: string | null
  phone: string | null // phone_at_attempt
  device: DeviceInfo | null
  target_centiseconds: number
  actual_centiseconds: number
  difference_centiseconds: number
  is_winner: boolean
}

export interface AttemptsQuery {
  page: number
  pageSize: number
  search: string
  dateFrom: string
  dateTo: string
  result: '' | 'won' | 'not_won'
  phone: '' | 'available' | 'missing'
}

export interface AttemptsResponse {
  summary: { total_attempts: number; winning_attempts: number; anonymous_attempts: number }
  items: AttemptItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
