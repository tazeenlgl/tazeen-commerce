import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { winnersApi } from '../api/winnersApi'
import { formatCentis } from '../lib/centis'
import { formatDateTime, shortDate } from '../lib/format'
import { useDebounced } from '../lib/useDebounced'
import { useFetch } from '../lib/useFetch'
import { usePage } from '../lib/usePage'
import { Badge } from '../components/Badge'
import { DeviceCell, PlayerCell } from '../components/PlayerCell'
import { Pager } from '../components/Pager'
import { StatTile } from '../components/StatTile'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'
import { control, td, th } from '../components/ui'

const statusLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')

export function WinnersPage() {
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [pageSize, setPageSize] = useState(50)
  const query = useDebounced(search.trim())
  const [page, setPage] = usePage(JSON.stringify([query, from, to, pageSize]))
  const { data, error, loading: fetching, reload: load } = useFetch(
    () => winnersApi.list({ page, pageSize, search: query, dateFrom: from, dateTo: to }),
    [page, pageSize, query, from, to],
  )

  const filtered = Boolean(query || from || to)
  const s = data?.summary

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Winners</h2>
        <p className="mt-1 text-sm text-slate-500">Players whose time exactly matched the day's target. There is no tolerance.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatTile label="Total winners" value={s ? s.total_winners.toLocaleString('en-IN') : '—'} />
        <StatTile label="Today's winners" value={s ? s.today_winners.toLocaleString('en-IN') : '—'} />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 text-xs text-slate-500">
          <div className="relative min-w-[220px] flex-1">
            <MagnifyingGlass size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Search" placeholder="Search phone or player ID" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${control} w-full pl-9`}
            />
          </div>
          <label className="flex items-center gap-2">From
            <input type="date" aria-label="Date from" className={control} value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="flex items-center gap-2">To
            <input type="date" aria-label="Date to" className={control} value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>

        {error ? <ErrorState message="Unable to load winners." onRetry={load} />
          : !data ? <LoadingState />
          : data.items.length === 0 ? <EmptyMessage title={filtered ? 'No winners match your filters.' : 'No winners yet.'} />
          : (
            <div className={`overflow-x-auto ${fetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-y border-slate-100">
                    {['Winner date', 'Player', 'Target', 'Actual', 'Attempted at', 'Device', 'Reward'].map((h) => <th key={h} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((w) => (
                    <tr key={w.id} className="border-b border-slate-100 text-sm text-slate-700">
                      <td className={`${td} font-semibold text-slate-900`}>{shortDate(w.winner_date)}</td>
                      <td className={td}><PlayerCell phone={w.phone} customerId={w.customer_id} /></td>
                      <td className={`${td} font-mono`}>{formatCentis(w.target_centiseconds)}</td>
                      <td className={`${td} font-mono`}>{formatCentis(w.actual_centiseconds)}</td>
                      <td className={td}>{formatDateTime(w.attempted_at)}</td>
                      <td className={td}><DeviceCell device={w.device} /></td>
                      <td className={td}>
                        <Badge tone={w.reward_status === 'pending' ? 'warn' : 'ok'}>{statusLabel(w.reward_status)}</Badge>
                        {w.reward_name && <div className="mt-0.5 text-[11px] text-slate-500">{w.reward_name}</div>}
                        {w.claimed_at && <div className="mt-0.5 text-[11px] text-slate-400">Claimed {formatDateTime(w.claimed_at)}</div>}
                      </td>
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
    </div>
  )
}
