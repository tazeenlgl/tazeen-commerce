import { useState } from 'react'
import { PencilSimple, Plus, Trash } from '@phosphor-icons/react'
import { targetsApi } from '../api/targetsApi'
import { formatCentis } from '../lib/centis'
import { formatDateTime, longDate, shortDate } from '../lib/format'
import { useFetch } from '../lib/useFetch'
import { usePage } from '../lib/usePage'
import type { TargetItem } from '../types/target'
import { TargetDialog } from '../components/TargetDialog'
import { ConfirmDialog } from '../components/Modal'
import { Pager } from '../components/Pager'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'

const primaryBtn = 'inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800'
const ghostBtn = 'inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50'
const dateInput = 'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400'
const th = 'px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400'

export function TargetsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [pageSize, setPageSize] = useState(50)
  const [editing, setEditing] = useState<{ item: TargetItem | null } | null>(null)
  const [deleting, setDeleting] = useState<TargetItem | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const [page, setPage] = usePage(JSON.stringify([from, to, pageSize]))
  const { data, error, loading: fetching, reload: load } = useFetch(
    () => targetsApi.list({ page, pageSize, dateFrom: from, dateTo: to }),
    [page, pageSize, from, to],
  )

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    // Deleting the only row on a later page would leave that page empty: step back a page.
    const wasLastOnPage = page > 1 && (data?.items.length ?? 0) === 1
    let deleted = false
    try {
      await targetsApi.remove(deleting.date)
      deleted = true
      setNotice({ ok: true, text: `Target for ${longDate(deleting.date)} deleted. Game history was not changed.` })
    } catch {
      setNotice({ ok: false, text: "The target couldn't be deleted. Please try again." })
    } finally {
      setBusy(false)
      setDeleting(null)
      if (deleted && wasLastOnPage) setPage(page - 1)
      else load()
    }
  }

  const today = data?.today

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Daily Targets</h2>
          <p className="mt-1 text-sm text-slate-500">Set the exact winner time customers see for each game day.</p>
        </div>
        <button type="button" className={primaryBtn} onClick={() => setEditing({ item: null })}>
          <Plus size={14} /> Set target
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${notice.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
        >
          {notice.text}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Today's target</div>
        {!today ? (
          error ? <p className="mt-2 text-sm text-slate-500">Unavailable.</p> : <LoadingState />
        ) : (
          <div className="mt-2 space-y-1">
            <div className="text-sm text-slate-500">{longDate(today.date)}</div>
            {today.target ? (
              <>
                <div className="font-mono text-3xl font-semibold text-slate-900">{formatCentis(today.target.target_centiseconds)}</div>
                <div className="text-sm text-slate-500">Today's Winner Time · exact match wins</div>
                <div className="pt-2">
                  <button type="button" className={ghostBtn} onClick={() => setEditing({ item: today.target })}>
                    <PencilSimple size={13} /> Edit target
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-red-600" role="alert">Today's target is not set. Customers see the game as unavailable.</p>
                <div className="pt-2">
                  <button type="button" className={primaryBtn} onClick={() => setEditing({ item: null })}>Set today's target</button>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900">Target history</h3>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <label className="flex items-center gap-2">From
              <input type="date" aria-label="Date from" className={dateInput} value={from} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label className="flex items-center gap-2">To
              <input type="date" aria-label="Date to" className={dateInput} value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
          </div>
        </div>

        {error ? (
          <ErrorState message="Unable to load daily targets." onRetry={load} />
        ) : !data ? (
          <LoadingState />
        ) : data.items.length === 0 ? (
          <EmptyMessage title={from || to ? 'No targets match your filters.' : 'No daily targets found.'} />
        ) : (
          <div className={`overflow-x-auto ${fetching ? 'opacity-60' : ''}`}>
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-y border-slate-100">
                  {['Date', 'Winner time', 'Set by', 'Created', 'Updated', 'Actions'].map((h) => <th key={h} className={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.date} className="border-b border-slate-100 text-sm text-slate-700">
                    <td className="px-4 py-3 font-semibold text-slate-900">{shortDate(r.date)}</td>
                    <td className="px-4 py-3 font-mono">{formatCentis(r.target_centiseconds)}</td>
                    <td className="px-4 py-3">{r.set_by ?? <span className="text-slate-400">—</span>}</td>
                    <td className="px-4 py-3">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">{formatDateTime(r.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" aria-label={`Edit target for ${shortDate(r.date)}`} className={ghostBtn} onClick={() => setEditing({ item: r })}>
                          <PencilSimple size={13} /> Edit
                        </button>
                        <button type="button" aria-label={`Delete target for ${shortDate(r.date)}`} className={`${ghostBtn} !border-red-100 !text-red-600 hover:!bg-red-50`} onClick={() => setDeleting(r)}>
                          <Trash size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > 0 && (
          <Pager
            page={data.page} pageSize={data.page_size} total={data.total} totalPages={data.total_pages}
            onPage={setPage} onPageSize={setPageSize}
          />
        )}
      </section>

      {editing && (
        <TargetDialog
          initial={editing.item}
          defaultDate={today?.date ?? ''}
          onClose={() => setEditing(null)}
          onSaved={(text) => { setEditing(null); setNotice({ ok: true, text }); load() }}
        />
      )}

      {deleting && (
        <ConfirmDialog title="Delete Daily Target?" confirmLabel="Delete Target" loading={busy} onCancel={() => !busy && setDeleting(null)} onConfirm={confirmDelete}>
          <p>Delete the winner time for {longDate(deleting.date)}?</p>
          <p>
            Existing game attempts and winners will not be deleted
            {deleting.attempts > 0 ? ` (${deleting.attempts} attempt${deleting.attempts === 1 ? '' : 's'} on this date stay as they are)` : ''}.
          </p>
        </ConfirmDialog>
      )}
    </div>
  )
}
