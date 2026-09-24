import { useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, targetsApi } from '../api/targetsApi'
import { formatCentis, parseTargetInput } from '../lib/centis'
import { longDate } from '../lib/format'
import type { TargetItem } from '../types/target'
import { Modal, btnGhost } from './Modal'

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500'

export function TargetDialog({
  initial, defaultDate, onClose, onSaved,
}: {
  initial: TargetItem | null
  defaultDate: string
  onClose: () => void
  onSaved: (text: string) => void
}) {
  const [date, setDate] = useState(initial?.date ?? defaultDate)
  const [time, setTime] = useState(initial ? formatCentis(initial.target_centiseconds) : '')
  const [errors, setErrors] = useState<{ date?: string; time?: string; form?: string }>({})
  const [saving, setSaving] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!date) next.date = 'Choose a date.'
    const cs = parseTargetInput(time)
    if (!time.trim()) next.time = 'Enter the winner time.'
    else if (cs === null)
      next.time = 'Use SS.cc, for example 10 or 10.50 (00:00.01 to 00:59.99, two decimals at most).'
    setErrors(next)
    if (next.date || next.time || cs === null) return

    setSaving(true)
    try {
      if (initial) await targetsApi.update(initial.date, cs)
      else await targetsApi.create(date, cs)
      onSaved(`Target for ${longDate(date)} saved: ${formatCentis(cs)}.`)
    } catch (err) {
      setErrors({
        form: err instanceof ApiError && err.status < 500
          ? err.message
          : "The target couldn't be saved. Please try again.",
      })
      setSaving(false)
    }
  }

  return (
    <Modal title={initial ? 'Edit target' : 'Set target'} onClose={() => !saving && onClose()}>
      <form onSubmit={submit} noValidate>
        <div className="space-y-4 p-6">
          <div>
            <label htmlFor="t-date" className="mb-1 block text-xs font-semibold text-slate-600">Date</label>
            <input id="t-date" type="date" className={inputClass} value={date} disabled={Boolean(initial)} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
          </div>
          <div>
            <label htmlFor="t-time" className="mb-1 block text-xs font-semibold text-slate-600">Winner time</label>
            <input
              id="t-time" inputMode="decimal" placeholder="00:10.00" autoFocus
              className={`${inputClass} font-mono`} value={time}
              onChange={(e) => setTime(e.target.value)}
              onBlur={() => { const cs = parseTargetInput(time); if (cs !== null) setTime(formatCentis(cs)) }}
            />
            {errors.time
              ? <p className="mt-1 text-xs text-red-600">{errors.time}</p>
              : <p className="mt-1 text-xs text-slate-400">Exact match wins (no tolerance). Shown as 00:10.00.</p>}
          </div>
          {errors.form && <p className="text-sm text-red-600" role="alert">{errors.form}</p>}
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onClose} disabled={saving} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save target'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
