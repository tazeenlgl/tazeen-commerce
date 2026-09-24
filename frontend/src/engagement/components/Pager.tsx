import { CaretLeft, CaretRight } from '@phosphor-icons/react'

const nav = 'flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40'

export function Pager({
  page, pageSize, total, totalPages, onPage, onPageSize,
}: {
  page: number
  pageSize: number
  total: number
  totalPages: number
  onPage: (p: number) => void
  onPageSize: (n: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
      <span>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span>
      <div className="flex items-center gap-2">
        <select
          aria-label="Rows per page"
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
        >
          {[25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <button aria-label="Previous page" className={nav} disabled={page <= 1} onClick={() => onPage(page - 1)}><CaretLeft size={14} /></button>
        <span>{page} / {totalPages}</span>
        <button aria-label="Next page" className={nav} disabled={page >= totalPages} onClick={() => onPage(page + 1)}><CaretRight size={14} /></button>
      </div>
    </div>
  )
}
