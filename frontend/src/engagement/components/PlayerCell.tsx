import { formatPhone } from '../lib/format'

/** Phone when known, else the short player id; anonymous attempts have no player. */
export function PlayerCell({ phone, customerId }: { phone: string | null; customerId: string | null }) {
  const ref = customerId ? customerId.slice(0, 8) : null
  if (!phone && !ref) return <span className="text-slate-400">No player</span>
  return (
    <div>
      <div className="font-semibold text-slate-900">{phone ? formatPhone(phone) : `Player #${ref}`}</div>
      {phone && ref && <div className="text-[11px] text-slate-400">#{ref}</div>}
    </div>
  )
}

export function DeviceCell({ device }: { device: { type: string | null; browser: string | null; os: string | null } | null }) {
  if (!device) return <span className="text-slate-400">—</span>
  const line = [device.browser, device.os].filter(Boolean).join(' · ')
  return (
    <div>
      <div className="capitalize">{device.type ?? 'Unknown'}</div>
      {line && <div className="text-[11px] text-slate-400">{line}</div>}
    </div>
  )
}
