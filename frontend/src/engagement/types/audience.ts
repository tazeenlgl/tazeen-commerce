// One row per device (customer_devices). Push state comes from that device's push_subscriptions.
// customer_* is null for anonymous devices (customer_devices.customer_id is nullable).
export type PushStatus = 'active' | 'inactive' | 'none'
export type Permission = 'granted' | 'denied' | 'default'

export interface AudienceItem {
  id: string // device id
  customer_id: string | null
  phone: string | null
  platform: string
  browser: string | null
  browser_version: string | null
  device_type: string | null
  installed: boolean
  permission: Permission
  push: PushStatus // active = permission granted AND an active subscription
  first_seen_at: string
  last_seen_at: string
  attempts: number // customer-level game totals; 0 when anonymous
  wins: number
}

export interface AudienceDetail extends AudienceItem {
  ip: string | null
  installed_at: string | null
  device_count: number // devices owned by the same customer
  first_played: string | null
  last_played: string | null
  push_last_success_at: string | null
  push_last_failure_at: string | null
}

export interface AudienceQuery {
  page: number
  pageSize: number
  search: string
  platform: string
  installed: '' | 'yes' | 'no'
  permission: '' | Permission
  push: '' | PushStatus
  customer: '' | 'linked' | 'anonymous'
  game: '' | 'played' | 'won' | 'not_played'
}

export interface AudienceResponse {
  summary: {
    total_audience: number
    active_installations: number
    push_subscribers: number
    players: number
    winners: number
    active_window_days: number
  }
  items: AudienceItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
