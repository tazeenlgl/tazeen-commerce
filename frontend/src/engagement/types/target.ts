export interface TargetItem {
  date: string // YYYY-MM-DD, unique
  target_centiseconds: number
  set_by: string | null
  created_at: string
  updated_at: string
  attempts: number
}

export interface TargetsQuery {
  page: number
  pageSize: number
  dateFrom: string
  dateTo: string
}

export interface TargetsResponse {
  today: { date: string; target: TargetItem | null }
  items: TargetItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
