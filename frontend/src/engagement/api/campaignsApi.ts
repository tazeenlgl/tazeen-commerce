// Local mock service. send() does NOT send anything; replace the bodies with POS backend calls
// later (list/get/create/countAudience/send map to the Game's notification endpoints).
import { estimateRecipients, seedCampaigns, simulateSend } from '../data/mockCampaigns'
import type { AudienceType, Campaign, NewCampaign, SendResult } from '../types/campaign'
import { ApiError } from './targetsApi'

let store: Campaign[] = seedCampaigns()
const wait = (ms = 250) => new Promise((r) => setTimeout(r, ms))

export const campaignsApi = {
  async list(): Promise<Campaign[]> {
    await wait()
    return [...store].sort((a, b) => b.created_at.localeCompare(a.created_at))
  },

  async get(id: string): Promise<Campaign> {
    await wait(150)
    const c = store.find((x) => x.id === id)
    if (!c) throw new ApiError(404, 'Notification campaign not found.')
    return c
  },

  /** Creates a draft. Nothing is sent. */
  async create(input: NewCampaign): Promise<Campaign> {
    await wait()
    const campaign: Campaign = {
      id: `c-${Date.now()}`,
      title: input.title,
      message: input.message,
      destination_url: input.destination_url,
      audience_type: input.audience_type,
      status: 'draft',
      created_at: new Date().toISOString(),
      sent_at: null,
      delivery_count: 0, sent_count: 0, stale_count: 0, failed_count: 0,
    }
    store = [campaign, ...store]
    return campaign
  },

  /** How many subscriptions a send would target right now. */
  async countAudience(type: AudienceType): Promise<number> {
    await wait(120)
    return estimateRecipients(type)
  },

  /** Mock send: records a simulated outcome. Completed unless any delivery failed (stale does not fail a campaign). */
  async send(id: string): Promise<SendResult> {
    const c = store.find((x) => x.id === id)
    if (!c) throw new ApiError(404, 'Notification campaign not found.')
    if (c.status !== 'draft') throw new ApiError(409, 'Campaign has already been sent or is currently sending.')
    await wait(900)
    const recipients = estimateRecipients(c.audience_type)
    const r = simulateSend(recipients)
    const next: Campaign = {
      ...c,
      status: r.failed === 0 ? 'completed' : 'failed',
      sent_at: new Date().toISOString(),
      delivery_count: recipients, sent_count: r.sent, stale_count: r.stale, failed_count: r.failed,
    }
    store = store.map((x) => (x.id === id ? next : x))
    return { campaign: next, recipients, ...r }
  },
}
