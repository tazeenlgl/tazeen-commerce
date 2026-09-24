import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Runs `fetcher` whenever `deps` change (or reload() is called). A response from an
 * outdated request is ignored, and the previous data stays visible while loading.
 */
export function useFetch<T>(fetcher: () => Promise<T>, deps: readonly (string | number | boolean)[]) {
  const [nonce, setNonce] = useState(0)
  const key = `${deps.join('|')}#${nonce}`
  const [result, setResult] = useState<{ key: string; data: T | null; error: boolean }>({ key: '', data: null, error: false })
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  useEffect(() => {
    let live = true
    fetcherRef.current()
      .then((data) => { if (live) setResult({ key, data, error: false }) })
      .catch(() => { if (live) setResult((r) => ({ key, data: r.data, error: true })) })
    return () => { live = false }
  }, [key])

  const reload = useCallback(() => setNonce((n) => n + 1), [])
  return { data: result.data, error: result.error && result.key === key, loading: result.key !== key, reload }
}
