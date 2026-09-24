import { useId } from 'react'
import type { ReactNode } from 'react'
import { Trash } from '@phosphor-icons/react'
import { useDialog } from '../lib/useDialog'

const btnGhost =
  'rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useDialog<HTMLDivElement>(onClose)
  const titleId = useId()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl outline-none">
        <h2 id={titleId} className="px-6 pt-6 text-lg font-semibold text-slate-900">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function ConfirmDialog({
  title, confirmLabel, loading, onCancel, onConfirm, children,
}: {
  title: string
  confirmLabel: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
  children: ReactNode
}) {
  const panel = useDialog<HTMLDivElement>(onCancel)
  const titleId = useId()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div ref={panel} tabIndex={-1} role="alertdialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl outline-none">
        <div className="p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
            <Trash size={21} className="text-red-600" />
          </div>
          <h2 id={titleId} className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
          <div className="mt-2 space-y-2 text-sm leading-6 text-slate-500">{children}</div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-3 rounded-b-2xl border-t border-slate-200 bg-white px-6 py-4">
          <button type="button" onClick={onCancel} disabled={loading} className={btnGhost}>Cancel</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export { btnGhost }
