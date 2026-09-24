import { campaignsApi } from '../api/campaignsApi'
import { useFetch } from '../lib/useFetch'
import { formatDateTime } from '../lib/format'
import { audienceLabel } from '../types/campaign'
import { Drawer } from './Drawer'
import { ErrorState, LoadingState } from './States'
import { StatTile } from './StatTile'
import { statusBadge } from './campaignBadges'

export function CampaignDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { data: c, error, reload: load } = useFetch(() => campaignsApi.get(id), [id])

  return (
    <Drawer title="Campaign" onClose={onClose}>
      {error ? <ErrorState message="Unable to load the campaign." onRetry={load} />
        : !c ? <LoadingState />
        : (
          <>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-900">{c.title}</span>
                {statusBadge(c.status)}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{c.message}</p>
            </div>
            <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm">
              {([
                ['Audience', audienceLabel(c.audience_type)],
                ['Destination', <span className="font-mono">{c.destination_url || '/'}</span>],
                ['Created', formatDateTime(c.created_at)],
                ['Sent at', formatDateTime(c.sent_at)],
              ] as const).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-3 py-2"><dt className="text-slate-500">{k}</dt><dd className="text-right text-slate-900">{v}</dd></div>
              ))}
            </dl>
            <div>
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Delivery results</h3>
              {c.status === 'draft' ? <p className="text-sm text-slate-500">Not sent yet.</p> : (
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label="Recipients" value={String(c.delivery_count)} />
                  <StatTile label="Accepted" value={String(c.sent_count)} />
                  <StatTile label="Stale" value={String(c.stale_count)} hint="Subscription expired" />
                  <StatTile label="Failed" value={String(c.failed_count)} />
                </div>
              )}
            </div>
          </>
        )}
    </Drawer>
  )
}
