import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { audienceApi } from '../api/audienceApi'
import { formatDateTime } from '../lib/format'
import { activate } from '../lib/a11y'
import { useDebounced } from '../lib/useDebounced'
import { useFetch } from '../lib/useFetch'
import { usePage } from '../lib/usePage'
import type { AudienceQuery } from '../types/audience'
import { AudienceDrawer } from '../components/AudienceDrawer'
import { Badge } from '../components/Badge'
import { DeviceCell, PlayerCell } from '../components/PlayerCell'
import { Pager } from '../components/Pager'
import { StatTile } from '../components/StatTile'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'
import { permissionBadge, pushBadge } from '../components/audienceBadges'
import { control, td, th } from '../components/ui'

const PLATFORMS = ['Android', 'iOS', 'Windows', 'macOS', 'Linux', 'ChromeOS', 'Unknown']
type Filters = Omit<AudienceQuery, 'page' | 'pageSize' | 'search'>
const NO_FILTERS: Filters = { platform: '', installed: '', permission: '', push: '', customer: '', game: '' }
const n = (v: number | undefined) => (v === undefined ? '—' : v.toLocaleString('en-IN'))

export function AudiencePage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [pageSize, setPageSize] = useState(50)
  const [open, setOpen] = useState<string | null>(null)
  const query = useDebounced(search.trim())
  const [page, setPage] = usePage(JSON.stringify([query, filters, pageSize]))
  const { data, error, loading: fetching, reload: load } = useFetch(
    () => audienceApi.list({ page, pageSize, search: query, ...filters }),
    [page, pageSize, query, JSON.stringify(filters)],
  )

  const filtered = Boolean(query) || Object.values(filters).some(Boolean)
  const set = <K extends keyof Filters>(key: K) => (e: { target: { value: string } }) => {
    setFilters((f) => ({ ...f, [key]: e.target.value as Filters[K] }))
  }
  const s = data?.summary

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Audience</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every device that has opened the game: who it belongs to, whether it is installed, whether it can receive push, and how they play.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="Total audience" value={n(s?.total_audience)} hint="Devices" />
        <StatTile label="Active installations" value={n(s?.active_installations)} hint={s ? `Installed, seen in ${s.active_window_days} days` : undefined} />
        <StatTile label="Push subscribers" value={n(s?.push_subscribers)} hint="Granted + active subscription" />
        <StatTile label="Players" value={n(s?.players)} hint="Customers with an attempt" />
        <StatTile label="Winners" value={n(s?.winners)} hint="Customers with a win" />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <MagnifyingGlass size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search" placeholder="Search phone, player or device ID, IP, browser" value={search}
              onChange={(e) => setSearch(e.target.value)} className={`${control} w-full pl-9`}
            />
          </div>
          <select aria-label="Platform" className={control} value={filters.platform} onChange={set('platform')}>
            <option value="">All platforms</option>
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select aria-label="Installation" className={control} value={filters.installed} onChange={set('installed')}>
            <option value="">All installs</option><option value="yes">Installed</option><option value="no">Not installed</option>
          </select>
          <select aria-label="Notification permission" className={control} value={filters.permission} onChange={set('permission')}>
            <option value="">All permissions</option><option value="granted">Granted</option><option value="denied">Denied</option><option value="default">Default</option>
          </select>
          <select aria-label="Push status" className={control} value={filters.push} onChange={set('push')}>
            <option value="">All push</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="none">None</option>
          </select>
          <select aria-label="Customer" className={control} value={filters.customer} onChange={set('customer')}>
            <option value="">All customers</option><option value="linked">Linked</option><option value="anonymous">Anonymous</option>
          </select>
          <select aria-label="Game" className={control} value={filters.game} onChange={set('game')}>
            <option value="">Any game activity</option><option value="played">Played</option><option value="won">Won</option><option value="not_played">Not played</option>
          </select>
        </div>

        {error ? <ErrorState message="Unable to load the audience." onRetry={load} />
          : !data ? <LoadingState />
          : data.items.length === 0 ? <EmptyMessage title={filtered ? 'No audience matches your filters.' : 'No audience found.'} />
          : (
            <div className={`overflow-x-auto ${fetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[940px] text-left">
                <thead>
                  <tr className="border-y border-slate-100">
                    {['Customer', 'Device', 'Installed', 'Notifications', 'Push', 'Game', 'Last active'].map((h) => <th key={h} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((a) => (
                    <tr key={a.id} onClick={() => setOpen(a.id)} className="cursor-pointer border-b border-slate-100 text-sm text-slate-700 hover:bg-slate-50 focus-within:bg-slate-50">
                      <td className={td}>
                        <div {...activate(() => setOpen(a.id))} aria-label="Open audience details">
                          {a.customer_id
                            ? <PlayerCell phone={a.phone} customerId={a.customer_id} />
                            : <div><div className="text-slate-500">Anonymous</div><div className="text-[11px] text-slate-400">Device #{a.id.slice(0, 8)}</div></div>}
                        </div>
                      </td>
                      <td className={td}>
                        <DeviceCell device={{ type: a.device_type, browser: a.browser ? `${a.browser}${a.browser_version ? ` ${a.browser_version}` : ''}` : null, os: a.platform === 'Unknown' ? null : a.platform }} />
                      </td>
                      <td className={td}>{a.installed ? <Badge tone="ok">Installed</Badge> : <Badge>Not installed</Badge>}</td>
                      <td className={td}>{permissionBadge(a.permission)}</td>
                      <td className={td}>{pushBadge(a.push)}</td>
                      <td className={td}>
                        {a.attempts === 0 ? <span className="text-slate-400">—</span> : (
                          <div>
                            <div>{a.attempts} attempt{a.attempts === 1 ? '' : 's'}</div>
                            {a.wins > 0 && <div className="text-[11px] font-semibold text-emerald-700">{a.wins} win{a.wins === 1 ? '' : 's'}</div>}
                          </div>
                        )}
                      </td>
                      <td className={td}>{formatDateTime(a.last_seen_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {data && data.total > 0 && (
          <Pager page={data.page} pageSize={data.page_size} total={data.total} totalPages={data.total_pages}
            onPage={setPage} onPageSize={setPageSize} />
        )}
      </section>

      {open && <AudienceDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
