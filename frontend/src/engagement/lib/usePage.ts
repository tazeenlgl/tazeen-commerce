import { useCallback, useState } from 'react'

/** Page number that resets to 1 by itself whenever `sig` (search, filters, page size) changes. */
export function usePage(sig: string) {
  const [state, setState] = useState({ page: 1, sig })
  const page = state.sig === sig ? state.page : 1
  const setPage = useCallback((p: number) => setState({ page: p, sig }), [sig])
  return [page, setPage] as const
}
