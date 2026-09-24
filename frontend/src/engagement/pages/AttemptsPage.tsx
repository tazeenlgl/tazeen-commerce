import { useState } from 'react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { attemptsApi } from '../api/attemptsApi'
import { formatCentis } from '../lib/centis'
import { formatDateTime, formatDifference } from '../lib/format'
import { useDebounced } from '../lib/useDebounced'
import { useFetch } from '../lib/useFetch'
import { usePage } from '../lib/usePage'
import type { AttemptsQuery } from '../types/attempt'
import { Badge } from '../components/Badge'
import { DeviceCell, PlayerCell } from '../components/PlayerCell'
import { Pager } from '../components/Pager'
import { StatTile } from '../components/StatTile'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'
import { control, td, th } from '../components/ui'

export function AttemptsPage() {
  const [search, setSearch] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [result, setResult] = useState<AttemptsQuery['result']>('')
  const [phone, setPhone] = useState<AttemptsQuery['phone']>('')
  const [pageSize, setPageSize] = useState(50)
  const query = useDebounced(search.trim())
  const [page, setPage] = usePage(JSON.stringify([query, from, to, result, phone, pageSize]))
  const { data, error, loading: fetching, reload: load } = useFetch(
    () => attemptsApi.list({ page, pageSize, search: query, dateFrom: from, dateTo: to, result, phone }),
    [page, pageSize, query, from, to, result, phone],
  )

  const filtered = Boolean(query || from || to || result || phone)
  const s = data?.summary

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Attempts</h2>
        <p className="mt-1 text-sm text-slate-500">Every game attempt. Only an exact match with the day's target wins.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Total attempts" value={s ? s.total_attempts.toLocaleString('en-IN') : '—'} />
        <StatTile label="Winning attempts" value={s ? s.winning_attempts.toLocaleString('en-IN') : '—'} />
        <StatTile label="Without a player" value={s ? s.anonymous_attempts.toLocaleString('en-IN') : '—'} hint="No customer linked" />
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
          <select aria-label="Result" className={control} value={result} onChange={(e) => setResult(e.target.value as AttemptsQuery['result'])}>
            <option value="">All results</option><option value="won">Won</option><option value="not_won">Did not win</option>
          </select>
          <select aria-label="Phone" className={control} value={phone} onChange={(e) => setPhone(e.target.value as AttemptsQuery['phone'])}>
            <option value="">Any phone</option><option value="available">Available</option><option value="missing">Not available</option>
          </select>
        </div>

        {error ? <ErrorState message="Unable to load attempts." onRetry={load} />
          : !data ? <LoadingState />
          : data.items.length === 0 ? <EmptyMessage title={filtered ? 'No attempts match your filters.' : 'No game attempts found.'} />
          : (
            <div className={`overflow-x-auto ${fetching ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="border-y border-slate-100">
                    {['Date & time', 'Player', 'Device', 'Target', 'Actual', 'Difference', 'Result'].map((h) => <th key={h} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((a) => (
                    <tr key={a.id} className="border-b border-slate-100 text-sm text-slate-700">
                      <td className={td}>{formatDateTime(a.attempted_at)}</td>
                      <td className={td}><PlayerCell phone={a.phone} customerId={a.customer_id} /></td>
                      <td className={td}><DeviceCell device={a.device} /></td>
                      <td className={`${td} font-mono`}>{formatCentis(a.target_centiseconds)}</td>
                      <td className={`${td} font-mono`}>{formatCentis(a.actual_centiseconds)}</td>
                      <td className={td}>{formatDifference(a.difference_centiseconds)}</td>
                      <td className={td}>{a.is_winner ? <Badge tone="ok">WIN</Badge> : <Badge>Did not win</Badge>}</td>
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
