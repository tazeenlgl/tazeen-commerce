// Aggregates the other Engagement APIs, so the dashboard always agrees with the tabs.
// When the POS backend exists this can become a single endpoint with the same response shape.
import { formatCentis } from '../lib/centis'
import { formatPhone, shortDate, todayIST } from '../lib/format'
import { audienceLabel } from '../types/campaign'
import type { ActivityItem, DashboardData } from '../types/dashboard'
import { attemptsApi } from './attemptsApi'
import { audienceApi } from './audienceApi'
import { campaignsApi } from './campaignsApi'
import { targetsApi } from './targetsApi'
import { winnersApi } from './winnersApi'

const player = (phone: string | null, id: string | null) =>
  phone ? formatPhone(phone) : id ? `Player #${id.slice(0, 8)}` : 'An anonymous player'

const ATTEMPT_QUERY = { page: 1, pageSize: 100, search: '', dateFrom: '', dateTo: '', result: '', phone: '' } as const
const AUDIENCE_QUERY = { page: 1, pageSize: 25, search: '', platform: '', installed: '', permission: '', push: '', customer: '', game: '' } as const

export const dashboardApi = {
  async get(): Promise<DashboardData> {
    const today = todayIST()
    const [audience, installed, attemptsToday, recentAttempts, winners, targets, campaigns] = await Promise.all([
      audienceApi.list({ ...AUDIENCE_QUERY }),
      audienceApi.list({ ...AUDIENCE_QUERY, installed: 'yes' }),
      attemptsApi.list({ ...ATTEMPT_QUERY, dateFrom: today, dateTo: today }),
      attemptsApi.list({ ...ATTEMPT_QUERY, pageSize: 25 }),
      winnersApi.list({ page: 1, pageSize: 25, search: '', dateFrom: '', dateTo: '' }),
      targetsApi.list({ page: 1, pageSize: 25, dateFrom: '', dateTo: '' }),
      campaignsApi.list(),
    ])

    const sent = campaigns.filter((c) => c.status !== 'draft')
    const sum = (f: (c: (typeof campaigns)[number]) => number) => campaigns.reduce((n, c) => n + f(c), 0)

    const activity: ActivityItem[] = [
      ...recentAttempts.items.filter((a) => !a.is_winner).slice(0, 8).map((a): ActivityItem => ({
        id: `a-${a.id}`, type: 'attempt', at: a.attempted_at,
        title: `${player(a.phone, a.customer_id)} played`,
        detail: `${formatCentis(a.actual_centiseconds)} vs target ${formatCentis(a.target_centiseconds)}`,
      })),
      ...winners.items.slice(0, 5).map((w): ActivityItem => ({
        id: `w-${w.id}`, type: 'winner', at: w.attempted_at,
        title: `${player(w.phone, w.customer_id)} won`,
        detail: `Exact match at ${formatCentis(w.actual_centiseconds)}`,
      })),
      ...campaigns.map((c): ActivityItem => ({
        id: `cc-${c.id}`, type: 'campaign_created', at: c.created_at,
        title: `Campaign created: ${c.title}`, detail: audienceLabel(c.audience_type),
      })),
      ...sent.filter((c) => c.sent_at).map((c): ActivityItem => ({
        id: `cs-${c.id}`, type: 'campaign_sent', at: c.sent_at as string, failed: c.status === 'failed',
        title: `Campaign ${c.status === 'failed' ? 'failed' : 'sent'}: ${c.title}`,
        detail: `${c.delivery_count} recipients · ${c.sent_count} accepted · ${c.stale_count} stale · ${c.failed_count} failed`,
      })),
      ...[...targets.items].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 3).map((t): ActivityItem => ({
        id: `t-${t.date}`, type: 'target', at: t.updated_at,
        title: `Target ${t.updated_at > t.created_at ? 'changed' : 'set'} for ${shortDate(t.date)}`,
        detail: `Winner time ${formatCentis(t.target_centiseconds)}`,
      })),
    ]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10)

    const todayPlayers = attemptsToday.total > attemptsToday.items.length
      ? null
      : new Set(attemptsToday.items.filter((a) => a.customer_id).map((a) => a.customer_id)).size

    return {
      summary: {
        players: audience.summary.players,
        pwa_installed: installed.total,
        push_subscribers: audience.summary.push_subscribers,
        active_installations: audience.summary.active_installations,
        active_window_days: audience.summary.active_window_days,
        total_attempts: attemptsToday.summary.total_attempts,
        total_winners: winners.summary.total_winners,
      },
      today: {
        date: targets.today.date,
        target_centiseconds: targets.today.target?.target_centiseconds ?? null,
        attempts: attemptsToday.total,
        players: todayPlayers,
        winners: winners.summary.today_winners,
      },
      campaigns: {
        drafts: campaigns.filter((c) => c.status === 'draft').length,
        completed: campaigns.filter((c) => c.status === 'completed').length,
        failed: campaigns.filter((c) => c.status === 'failed').length,
        recipients: sum((c) => c.delivery_count),
        accepted: sum((c) => c.sent_count),
        stale: sum((c) => c.stale_count),
        failed_deliveries: sum((c) => c.failed_count),
        recent: campaigns.slice(0, 5),
      },
      activity,
    }
  },
}
