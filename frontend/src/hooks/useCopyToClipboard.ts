import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyState = 'idle' | 'copied' | 'error'

/** Salin teks ke clipboard + state feedback singkat ("Tersalin") yang kembali ke `idle` setelah `resetMs`. */
export function useCopyToClipboard(resetMs = 2000) {
  const [state, setState] = useState<CopyState>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setState('copied')
      } catch {
        // Clipboard API butuh secure context (https/localhost) & izin browser
        setState('error')
      }
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setState('idle'), resetMs)
    },
    [resetMs],
  )

  return { state, copy }
}
