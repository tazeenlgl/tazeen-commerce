/** 1000 -> "00:10.00" (MM:SS.cc). Integer centiseconds are the only stored form. */
export function formatCentis(centis: number): string {
  const total = Math.max(0, Math.floor(centis))
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(total / 6000))}:${pad(Math.floor((total % 6000) / 100))}.${pad(total % 100)}`
}

export const MIN_TARGET_CS = 1

export const MAX_TARGET_CS = 5999

/** Accepts "10", "10.5", "10.50", "00:10.00". Returns null when invalid. */
export function parseTargetInput(text: string): number | null {
  const m = /^(?:(\d{1,2}):)?(\d{1,2})(?:\.(\d{1,2}))?$/.exec(text.trim())
  if (!m) return null
  if (m[1] !== undefined && Number(m[1]) !== 0) return null
  const seconds = Number(m[2])
  if (seconds > 59) return null
  const frac = m[3] === undefined ? 0 : Number(m[3].padEnd(2, '0'))
  const cs = seconds * 100 + frac
  return cs >= MIN_TARGET_CS && cs <= MAX_TARGET_CS ? cs : null
}
