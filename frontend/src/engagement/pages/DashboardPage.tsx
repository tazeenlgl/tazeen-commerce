import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/dashboardApi'
import { useFetch } from '../lib/useFetch'
import { formatCentis } from '../lib/centis'
import { formatDateTime, longDate } from '../lib/format'
import { audienceLabel } from '../types/campaign'
import type { ActivityType } from '../types/dashboard'
import { Badge } from '../components/Badge'
import { MetricCard } from '../components/MetricCard'
import { StatTile } from '../components/StatTile'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'
import { statusBadge } from '../components/campaignBadges'
import { td, th } from '../components/ui'

const n = (v: number) => v.toLocaleString('en-IN')
const ACTIVITY: Record<ActivityType, { label: string; tone: 'ok' | 'warn' | 'neutral' }> = {
  attempt: { label: 'Attempt', tone: 'neutral' },
  winner: { label: 'Winner', tone: 'ok' },
  campaign_created: { label: 'Campaign', tone: 'neutral' },
  campaign_sent: { label: 'Sent', tone: 'ok' },
  target: { label: 'Target', tone: 'warn' },
}

export function DashboardPage() {
  const { data, error, reload: load } = useFetch(() => dashboardApi.get(), [])

  if (error) return <ErrorState message="The dashboard couldn't be loaded." onRetry={load} />
  if (!data) return <LoadingState />
  const { summary: s, today: t, campaigns: c } = data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Players" value={n(s.players)} hint="Customers who have played" />
        <StatTile label="PWA installed" value={n(s.pwa_installed)} hint="Devices" />
        <StatTile label="Push subscribers" value={n(s.push_subscribers)} hint="Granted + active subscription" />
        <StatTile label="Today's winners" value={n(t.winners)} />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Today's game"
          action={{ to: '/engagement/targets', label: 'Targets' }}
          items={[
            { label: longDate(t.date), value: t.target_centiseconds === null ? <Badge tone="danger">Target not set</Badge> : <Badge tone="ok">Target set</Badge> },
            { label: 'Winner time', value: t.target_centiseconds === null ? 'Not set' : <span className="font-mono">{formatCentis(t.target_centiseconds)}</span> },
            { label: 'Players', value: t.players === null ? '—' : n(t.players) },
            { label: 'Attempts', value: n(t.attempts) },
            { label: 'Winners', value: n(t.winners) },
          ]}
        />
        <MetricCard
          title="Overall"
          action={{ to: '/engagement/attempts', label: 'Attempts' }}
          items={[
            { label: 'Total attempts', value: n(s.total_attempts) },
            { label: 'Total winners', value: n(s.total_winners) },
            { label: `Active installations (${s.active_window_days} days)`, value: n(s.active_installations) },
          ]}
        />
        <MetricCard
          title="Campaigns"
          action={{ to: '/engagement/campaigns', label: 'Campaigns' }}
          items={[
            { label: 'Drafts', value: n(c.drafts) },
            { label: 'Completed', value: n(c.completed) },
            { label: 'Failed', value: n(c.failed) },
            { label: 'Deliveries accepted', value: n(c.accepted) },
            { label: 'Stale / failed', value: `${n(c.stale)} / ${n(c.failed_deliveries)}` },
          ]}
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Recent campaigns</h3>
          <Link to="/engagement/campaigns" className="text-xs font-medium text-slate-500 hover:text-slate-900">View all</Link>
        </div>
        {c.recent.length === 0 ? <EmptyMessage title="No campaigns yet." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-y border-slate-100">
                  {['Campaign', 'Audience', 'Recipients', 'Accepted', 'Stale', 'Failed', 'Status', 'Sent at'].map((h) => <th key={h} className={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {c.recent.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 text-sm text-slate-700">
                    <td className={`${td} font-semibold text-slate-900`}>{r.title}</td>
                    <td className={td}>{audienceLabel(r.audience_type)}</td>
                    <td className={td}>{r.status === 'draft' ? '—' : n(r.delivery_count)}</td>
                    <td className={td}>{r.status === 'draft' ? '—' : n(r.sent_count)}</td>
                    <td className={td}>{r.status === 'draft' ? '—' : n(r.stale_count)}</td>
                    <td className={td}>{r.status === 'draft' ? '—' : n(r.failed_count)}</td>
                    <td className={td}>{statusBadge(r.status)}</td>
                    <td className={td}>{formatDateTime(r.sent_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Recent activity</h3></div>
        {data.activity.length === 0 ? <EmptyMessage title="No activity yet." /> : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {data.activity.map((a) => {
              const meta = ACTIVITY[a.type]
              return (
                <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm">
                  <span className="w-20 shrink-0"><Badge tone={a.failed ? 'warn' : meta.tone}>{meta.label}</Badge></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-900">{a.title}</span>
                    <span className="block truncate text-xs text-slate-500">{a.detail}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{formatDateTime(a.at)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
