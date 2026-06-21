import * as React from 'react'

const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  const getSnapshot = () =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false

  const subscribe = (callback: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handler = () => callback()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false)
}
