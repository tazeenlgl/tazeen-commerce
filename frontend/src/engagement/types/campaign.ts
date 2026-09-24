// notification_campaigns + aggregated notification_deliveries. Statuses/counts as the Game reports them.
export type CampaignStatus = 'draft' | 'sending' | 'completed' | 'failed'

export type AudienceType = 'all_subscribers' | 'active' | 'winners' | 'players' | 'phone_available'

export const AUDIENCE_TYPES: { value: AudienceType; label: string; hint: string }[] = [
  { value: 'all_subscribers', label: 'All subscribers', hint: 'Active push subscription with notifications granted' },
  { value: 'active', label: 'Active users', hint: 'Subscribers seen in the last 7 days' },
  { value: 'winners', label: 'Winners', hint: 'Subscribers who have won the game' },
  { value: 'players', label: 'Players', hint: 'Subscribers who have played the game' },
  { value: 'phone_available', label: 'Phone available', hint: 'Subscribers with a phone number' },
]

export const audienceLabel = (v: string) => AUDIENCE_TYPES.find((a) => a.value === v)?.label ?? v

export const CAMPAIGN_LIMITS = { title: 160, message: 2000, url: 2048 }

export interface Campaign {
  id: string
  title: string
  message: string
  destination_url: string | null
  audience_type: AudienceType
  status: CampaignStatus
  created_at: string
  sent_at: string | null
  // Delivery results (notification_deliveries). "sent" is shown as "Accepted".
  delivery_count: number // recipients
  sent_count: number
  stale_count: number
  failed_count: number
}

export interface NewCampaign {
  title: string
  message: string
  destination_url: string
  audience_type: AudienceType
}

export interface SendResult {
  campaign: Campaign
  recipients: number
  sent: number
  stale: number
  failed: number
}
