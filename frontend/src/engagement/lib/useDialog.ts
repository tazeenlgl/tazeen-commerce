import { useEffect, useRef } from 'react'

const stack: object[] = [] // open dialogs, so Escape only closes the topmost one

/** Escape-to-close, initial focus and focus restore for a dialog/drawer panel. */
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const panel = useRef<T>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    const token = {}
    stack.push(token)
    const previous = document.activeElement as HTMLElement | null
    if (panel.current && !panel.current.contains(document.activeElement)) panel.current.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === token) {
        e.preventDefault()
        closeRef.current()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      stack.splice(stack.indexOf(token), 1)
      previous?.focus?.()
    }
  }, [])
  return panel
}
