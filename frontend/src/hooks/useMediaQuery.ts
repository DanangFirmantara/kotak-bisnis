import { useCallback, useSyncExternalStore } from 'react'

/**
 * `true` selama media query cocok; ikut berubah saat viewport/pointer berubah.
 * Untuk layout cukup pakai class Tailwind — hook ini hanya bila nilainya dibutuhkan di JS
 * (mis. tinggi chart Recharts, mematikan Tilt di layar sentuh). Query dari `MEDIA_QUERY` (lib/responsive.ts).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
