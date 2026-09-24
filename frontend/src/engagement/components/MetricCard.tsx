import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function MetricCard({
  title, items, action,
}: {
  title: string
  items: { label: string; value: ReactNode }[]
  action?: { to: string; label: string }
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
        {action && <Link to={action.to} className="text-xs font-medium text-slate-500 hover:text-slate-900">{action.label}</Link>}
      </div>
      <dl className="mt-3 divide-y divide-slate-100 text-sm">
        {items.map((i) => (
          <div key={i.label} className="flex items-center justify-between gap-3 py-2">
            <dt className="text-slate-500">{i.label}</dt>
            <dd className="font-semibold text-slate-900">{i.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
