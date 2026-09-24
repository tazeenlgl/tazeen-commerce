import type { Campaign } from './campaign'

export type ActivityType = 'attempt' | 'winner' | 'campaign_created' | 'campaign_sent' | 'target'

export interface ActivityItem {
  id: string
  type: ActivityType
  at: string
  title: string
  detail: string
  failed?: boolean // campaign_sent with failed deliveries
}

export interface DashboardData {
  summary: {
    players: number // customers with at least one attempt (same definition as Audience)
    pwa_installed: number
    push_subscribers: number
    active_installations: number
    active_window_days: number
    total_attempts: number
    total_winners: number
  }
  today: {
    date: string
    target_centiseconds: number | null
    attempts: number
    players: number | null // null when the day has more attempts than were fetched
    winners: number
  }
  campaigns: {
    drafts: number
    completed: number
    failed: number
    recipients: number
    accepted: number
    stale: number
    failed_deliveries: number
    recent: Campaign[]
  }
  activity: ActivityItem[]
}
