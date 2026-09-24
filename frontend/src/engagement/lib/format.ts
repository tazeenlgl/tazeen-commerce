const dateFmt = (opts: Intl.DateTimeFormatOptions) => (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { ...opts, timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  )

export const longDate = dateFmt({ day: 'numeric', month: 'long', year: 'numeric' })

export const shortDate = dateFmt({ day: '2-digit', month: 'short', year: 'numeric' })

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

/** Today's date (YYYY-MM-DD) in India, the game's business timezone. */
export function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** "+0.25 s" / "-1.10 s" / "Exact match" from a signed centisecond difference. */
export function formatDifference(cs: number): string {
  if (cs === 0) return 'Exact match'
  return `${cs > 0 ? '+' : '-'}${(Math.abs(cs) / 100).toFixed(2)} s`
}

/** "+919876543210" -> "+91 98765 43210". */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return '—'
  const m = /^\+91(\d{5})(\d{5})$/.exec(value)
  return m ? `+91 ${m[1]} ${m[2]}` : value
}
