import type { KeyboardEvent } from 'react'

/** Props that make a non-button element act as a keyboard-accessible button (Enter / Space). */
export const activate = (fn: () => void) => ({
  role: 'button' as const,
  tabIndex: 0,
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  },
  className: 'cursor-pointer rounded outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
})
