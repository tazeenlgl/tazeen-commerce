import { useEffect, useState } from 'react'
import { campaignsApi } from '../api/campaignsApi'
import { audienceLabel } from '../types/campaign'
import type { Campaign, SendResult } from '../types/campaign'
import { Modal, btnGhost } from './Modal'
import { StatTile } from './StatTile'
import { statusBadge } from './campaignBadges'

type Step = 'review' | 'confirm' | 'sending' | 'result'
const primary = 'rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50'

/** Draft -> Review -> Confirmation -> (mock) send -> result. Nothing is actually sent. */
export function SendCampaignDialog({ campaign, onClose, onDone, onRefresh }: { campaign: Campaign; onClose: () => void; onDone: () => void; onRefresh: () => void }) {
  const [step, setStep] = useState<Step>('review')
  const [recipients, setRecipients] = useState<number | null>(null)
  const [recipientsError, setRecipientsError] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    campaignsApi.countAudience(campaign.audience_type)
      .then((n) => live && setRecipients(n))
      .catch(() => live && setRecipientsError(true))
    return () => { live = false }
  }, [campaign.audience_type])

  async function send() {
    setError(null)
    setStep('sending')
    try {
      setResult(await campaignsApi.send(campaign.id))
      setStep('result')
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "The campaign couldn't be sent.")
      setStep('confirm')
      onRefresh()
    }
  }

  const close = () => (step === 'sending' ? undefined : step === 'result' ? onDone() : onClose())
  const count = recipients === null ? (recipientsError ? 'unknown' : '…') : recipients.toLocaleString('en-IN')

  return (
    <Modal title={step === 'result' ? 'Send result' : step === 'confirm' || step === 'sending' ? 'Send campaign?' : 'Review campaign'} onClose={close}>
      <div className="space-y-3 p-6 text-sm text-slate-600">
        {(step === 'review') && (
          <>
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="font-semibold text-slate-900">{campaign.title}</div>
              <p className="mt-1 whitespace-pre-wrap">{campaign.message}</p>
              <dl className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between"><dt className="text-slate-400">Audience</dt><dd>{audienceLabel(campaign.audience_type)}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Opens</dt><dd className="font-mono">{campaign.destination_url || '/'}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-400">Estimated recipients</dt><dd>{count}</dd></div>
              </dl>
            </div>
            {recipients === 0 && <p className="text-amber-700">No subscribers match this audience right now.</p>}
          </>
        )}
        {(step === 'confirm' || step === 'sending') && (
          <>
            <p className="font-semibold text-slate-900">{campaign.title}</p>
            <p>
              This notification will be sent to {count} active subscriber{recipients === 1 ? '' : 's'} ({audienceLabel(campaign.audience_type)}). It can't be undone.
            </p>
            {error && <p className="text-red-600" role="alert">{error}</p>}
          </>
        )}
        {step === 'result' && result && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{result.campaign.title}</span>
              {statusBadge(result.campaign.status)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Recipients" value={String(result.recipients)} />
              <StatTile label="Accepted" value={String(result.sent)} />
              <StatTile label="Stale" value={String(result.stale)} />
              <StatTile label="Failed" value={String(result.failed)} />
            </div>
          </>
        )}
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Preview mode: no push notification is actually sent yet.
        </p>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4">
        {step === 'review' && (<>
          <button type="button" className={btnGhost} onClick={onClose}>Cancel</button>
          <button type="button" className={primary} onClick={() => setStep('confirm')}>Continue</button>
        </>)}
        {(step === 'confirm' || step === 'sending') && (<>
          <button type="button" className={btnGhost} disabled={step === 'sending'} onClick={() => setStep('review')}>Back</button>
          <button type="button" className={primary} disabled={step === 'sending'} onClick={send}>
            {step === 'sending' ? 'Sending…' : 'Send notification'}
          </button>
        </>)}
        {step === 'result' && <button type="button" className={primary} onClick={onDone}>Done</button>}
      </div>
    </Modal>
  )
}
