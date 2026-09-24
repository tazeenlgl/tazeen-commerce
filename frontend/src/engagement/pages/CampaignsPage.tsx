import { useMemo, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { campaignsApi } from '../api/campaignsApi'
import { activate } from '../lib/a11y'
import { formatDateTime } from '../lib/format'
import { useFetch } from '../lib/useFetch'
import { audienceLabel } from '../types/campaign'
import type { Campaign } from '../types/campaign'
import { CampaignDialog } from '../components/CampaignDialog'
import { CampaignDrawer } from '../components/CampaignDrawer'
import { SendCampaignDialog } from '../components/SendCampaignDialog'
import { EmptyMessage, ErrorState, LoadingState } from '../components/States'
import { statusBadge } from '../components/campaignBadges'
import { td, th } from '../components/ui'

const FILTERS = {
  all: { label: 'All', test: () => true },
  draft: { label: 'Drafts', test: (c: Campaign) => c.status === 'draft' },
  completed: { label: 'Completed', test: (c: Campaign) => c.status === 'completed' },
  failed: { label: 'Failed', test: (c: Campaign) => c.status === 'failed' },
} as const
type FilterKey = keyof typeof FILTERS

const num = (c: Campaign, v: number) => (c.status === 'draft' ? <span className="text-slate-300">—</span> : v.toLocaleString('en-IN'))

export function CampaignsPage() {
  const [tab, setTab] = useState<FilterKey>('all')
  const [creating, setCreating] = useState(false)
  const [sending, setSending] = useState<Campaign | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const { data: items, error, reload: load } = useFetch(() => campaignsApi.list(), [])

  const counts = useMemo(
    () => Object.fromEntries((Object.keys(FILTERS) as FilterKey[]).map((k) => [k, (items ?? []).filter(FILTERS[k].test).length])) as Record<FilterKey, number>,
    [items],
  )
  const rows = (items ?? []).filter(FILTERS[tab].test)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Campaigns</h2>
          <p className="mt-1 text-sm text-slate-500">Create drafts and send push notifications to an audience.</p>
        </div>
        <button type="button" onClick={() => setCreating(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800">
          <Plus size={14} /> New campaign
        </button>
      </div>

      {notice && <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2">
          {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
            <button
              key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition ${tab === k ? 'border-slate-900 font-semibold text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {FILTERS[k].label} <span className="ml-1 text-xs text-slate-400">{items ? counts[k] : ''}</span>
            </button>
          ))}
        </div>

        {error ? <ErrorState message="Campaigns couldn't be loaded." onRetry={load} />
          : !items ? <LoadingState />
          : rows.length === 0 ? <EmptyMessage title="No campaigns here. New drafts and sent campaigns appear in this list." />
          : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Title', 'Audience', 'Recipients', 'Accepted', 'Stale', 'Failed', 'Status', 'Created', 'Sent at', ''].map((h, i) => <th key={i} className={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id} onClick={() => setOpen(c.id)} className="cursor-pointer border-b border-slate-100 text-sm text-slate-700 hover:bg-slate-50 focus-within:bg-slate-50">
                      <td className={`${td} font-semibold text-slate-900`}><span {...activate(() => setOpen(c.id))}>{c.title}</span></td>
                      <td className={td}>{audienceLabel(c.audience_type)}</td>
                      <td className={td}>{num(c, c.delivery_count)}</td>
                      <td className={td}>{num(c, c.sent_count)}</td>
                      <td className={td}>{num(c, c.stale_count)}</td>
                      <td className={td}>{num(c, c.failed_count)}</td>
                      <td className={td}>{statusBadge(c.status)}</td>
                      <td className={td}>{formatDateTime(c.created_at)}</td>
                      <td className={td}>{formatDateTime(c.sent_at)}</td>
                      <td className={td} onClick={(e) => e.stopPropagation()}>
                        {c.status === 'draft' && (
                          <button type="button" onClick={() => { setNotice(null); setSending(c) }} className="rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800">
                            Send
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>

      {creating && (
        <CampaignDialog
          onClose={() => setCreating(false)}
          onCreated={() => { setCreating(false); setNotice('Draft saved. It has not been sent.'); setTab('draft'); load() }}
        />
      )}
      {sending && (
        <SendCampaignDialog
          campaign={sending}
          onClose={() => setSending(null)}
          onRefresh={load}
          onDone={() => { setNotice(`"${sending.title}" processed (preview mode, nothing was sent).`); setSending(null); load() }}
        />
      )}
      {open && <CampaignDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
