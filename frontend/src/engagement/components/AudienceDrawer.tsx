import type { ReactNode } from 'react'
import { audienceApi } from '../api/audienceApi'
import { useFetch } from '../lib/useFetch'
import { formatDateTime, formatPhone } from '../lib/format'
import { Badge } from './Badge'
import { Drawer } from './Drawer'
import { ErrorState, LoadingState } from './States'
import { permissionBadge, pushBadge } from './audienceBadges'

const dash = <span className="text-slate-400">—</span>
const when = (v: string | null) => (v ? formatDateTime(v) : dash)

function Section({ title, rows }: { title: string; rows: [string, ReactNode][] }) {
  return (
    <section>
      <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 px-3 py-2">
            <dt className="text-slate-500">{k}</dt>
            <dd className="text-right text-slate-900">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export function AudienceDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: d, error, reload: load } = useFetch(() => audienceApi.get(id), [id])

  return (
    <Drawer title="Audience member" onClose={onClose}>
      {error ? <ErrorState message="Unable to load details." onRetry={load} />
        : !d ? <LoadingState />
        : (
          <>
            <div>
              <div className="text-base font-semibold text-slate-900">
                {d.phone ? formatPhone(d.phone) : d.customer_id ? `Player #${d.customer_id.slice(0, 8)}` : 'Anonymous'}
              </div>
              <div className="text-xs text-slate-400">Device #{d.id.slice(0, 8)}</div>
            </div>
            <Section title="Profile" rows={[
              ['Customer ID', d.customer_id ? <span className="font-mono">{d.customer_id.slice(0, 8)}…</span> : dash],
              ['Phone', d.phone ? formatPhone(d.phone) : dash],
              ['Devices', d.customer_id ? d.device_count : dash],
            ]} />
            <Section title="Device" rows={[
              ['Platform', d.platform === 'Unknown' ? dash : d.platform],
              ['Browser', d.browser ? `${d.browser}${d.browser_version ? ` ${d.browser_version}` : ''}` : dash],
              ['Type', d.device_type ? <span className="capitalize">{d.device_type}</span> : dash],
              ['IP', d.ip ?? dash],
              ['First seen', when(d.first_seen_at)],
              ['Last seen', when(d.last_seen_at)],
            ]} />
            <Section title="Installation & push" rows={[
              ['Installation', d.installed ? <Badge tone="ok">Installed</Badge> : <Badge>Not installed</Badge>],
              ['Installed at', when(d.installed_at)],
              ['Notifications', permissionBadge(d.permission)],
              ['Push', pushBadge(d.push)],
              ['Last push success', when(d.push_last_success_at)],
              ['Last push failure', when(d.push_last_failure_at)],
            ]} />
            <Section title="Game" rows={[
              ['Attempts', d.attempts],
              ['Wins', d.wins],
              ['First played', when(d.first_played)],
              ['Last played', when(d.last_played)],
            ]} />
          </>
        )}
    </Drawer>
  )
}
