import { seedAudience } from './mockAudience'
import type { AudienceType, Campaign } from '../types/campaign'

// Placeholder data until the POS backend exists.
const devices = seedAudience()
const ACTIVE_DAYS = 7

/** Same conditions as the Game's _audience_condition, evaluated on the mock Audience data. */
export function estimateRecipients(type: AudienceType): number {
  const cutoff = Date.now() - ACTIVE_DAYS * 86400000
  return devices.filter((d) => {
    // Game joins customers, so anonymous devices are never recipients.
    if (d.push !== 'active' || !d.customer_id) return false
    switch (type) {
      case 'all_subscribers': return true
      case 'active': return Date.parse(d.last_seen_at) >= cutoff
      case 'winners': return d.wins > 0
      case 'players': return d.attempts > 0
      case 'phone_available': return Boolean(d.phone)
    }
  }).length
}

/** Mock outcome only: nothing is sent anywhere. */
export function simulateSend(recipients: number): { sent: number; stale: number; failed: number } {
  const stale = Math.floor(recipients * 0.08)
  const failed = recipients > 0 && Math.random() < 0.25 ? Math.max(1, Math.floor(recipients * 0.05)) : 0
  return { sent: recipients - stale - failed, stale, failed }
}

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString()

export function seedCampaigns(): Campaign[] {
  const done = (id: string, title: string, message: string, type: AudienceType, days: number, failedShare: number): Campaign => {
    const n = estimateRecipients(type)
    const stale = Math.floor(n * 0.1)
    const failed = Math.floor(n * failedShare)
    return {
      id, title, message, destination_url: '/', audience_type: type,
      status: failed > 0 ? 'failed' : 'completed',
      created_at: ago(days + 0.1), sent_at: ago(days),
      delivery_count: n, sent_count: n - stale - failed, stale_count: stale, failed_count: failed,
    }
  }
  return [
    {
      id: 'c-draft', title: "Play today's game", message: "Today's winner time is live. Can you hit it exactly?",
      destination_url: '/', audience_type: 'all_subscribers', status: 'draft',
      created_at: ago(0.2), sent_at: null, delivery_count: 0, sent_count: 0, stale_count: 0, failed_count: 0,
    },
    done('c-1', 'Winners announcement', 'Congratulations to yesterday\'s winners! Check your reward.', 'winners', 2, 0),
    done('c-2', 'We miss you', 'Come back and play — a new target is waiting.', 'active', 5, 0.2),
    done('c-3', 'Weekend special', 'Play the weekend game and win.', 'players', 9, 0),
  ]
}
