import { useEffect, useState } from 'react'

// Real network debouncing (not just deferred rendering) — a search input's
// value is only committed after `delay` ms of no further typing, so a
// filtered query/render doesn't run on every keystroke.
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
