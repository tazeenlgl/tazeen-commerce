import { useState } from 'react'
import type { FormEvent } from 'react'
import { campaignsApi } from '../api/campaignsApi'
import { useFetch } from '../lib/useFetch'
import { validateDestination } from '../lib/url'
import { AUDIENCE_TYPES, CAMPAIGN_LIMITS } from '../types/campaign'
import type { AudienceType } from '../types/campaign'
import { Modal, btnGhost } from './Modal'
import { control } from './ui'

const field = `${control} h-10 w-full`

export function CampaignDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState<AudienceType>('all_subscribers')
  const [url, setUrl] = useState('/')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const est = useFetch(() => campaignsApi.countAudience(audience), [audience])

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Enter a title.'
    else if (title.length > CAMPAIGN_LIMITS.title) next.title = `Keep the title under ${CAMPAIGN_LIMITS.title} characters.`
    if (!message.trim()) next.message = 'Enter a message.'
    else if (message.length > CAMPAIGN_LIMITS.message) next.message = `Keep the message under ${CAMPAIGN_LIMITS.message} characters.`
    const dest = url.trim() || '/'
    const urlError = validateDestination(dest)
    if (urlError) next.url = urlError
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await campaignsApi.create({ title: title.trim(), message: message.trim(), destination_url: dest, audience_type: audience })
      onCreated()
    } catch {
      setErrors({ form: "The draft couldn't be saved. Please try again." })
      setSaving(false)
    }
  }

  const label = 'mb-1 block text-xs font-semibold text-slate-600'
  const err = (k: string) => errors[k] && <p className="mt-1 text-xs text-red-600">{errors[k]}</p>
  const hint = AUDIENCE_TYPES.find((a) => a.value === audience)?.hint

  return (
    <Modal title="New campaign" onClose={() => !saving && onClose()}>
      <form onSubmit={submit} noValidate>
        <div className="space-y-4 p-6">
          <div>
            <label htmlFor="c-title" className={label}>Title</label>
            <input id="c-title" className={field} value={title} maxLength={CAMPAIGN_LIMITS.title} autoFocus onChange={(e) => setTitle(e.target.value)} />
            {err('title')}
          </div>
          <div>
            <label htmlFor="c-msg" className={label}>Message</label>
            <textarea id="c-msg" rows={4} className={`${control} h-auto w-full py-2`} value={message} maxLength={CAMPAIGN_LIMITS.message} onChange={(e) => setMessage(e.target.value)} />
            {err('message')}
          </div>
          <div>
            <label htmlFor="c-aud" className={label}>Audience</label>
            <select id="c-aud" className={field} value={audience} onChange={(e) => setAudience(e.target.value as AudienceType)}>
              {AUDIENCE_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <p className="mt-1 text-xs text-slate-400">
              {hint} · Estimated recipients: {est.error ? '—' : est.loading || est.data === null ? '…' : est.data.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <label htmlFor="c-url" className={label}>Destination URL</label>
            <input id="c-url" className={field} value={url} onChange={(e) => setUrl(e.target.value)} />
            {errors.url ? err('url') : <p className="mt-1 text-xs text-slate-400">Where the notification opens. Default: /</p>}
          </div>
          {errors.form && <p className="text-sm text-red-600" role="alert">{errors.form}</p>}
          <p className="text-xs text-slate-400">Saving creates a draft. Nothing is sent until you confirm.</p>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onClose} disabled={saving} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save draft'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
