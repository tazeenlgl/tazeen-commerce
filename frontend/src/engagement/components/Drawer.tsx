import { useId } from 'react'
import type { ReactNode } from 'react'
import { X } from '@phosphor-icons/react'
import { useDialog } from '../lib/useDialog'

export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const panel = useDialog<HTMLElement>(onClose)
  const titleId = useId()
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex h-full w-full max-w-md flex-col bg-white shadow-xl outline-none">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-slate-900">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  )
}
