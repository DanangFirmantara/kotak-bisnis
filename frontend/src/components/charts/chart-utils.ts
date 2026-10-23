import { useId } from 'react'

/** Warna chart = token CSS dari index.css (tidak hardcode hex). */
export const CHART_COLORS = {
  primary: 'var(--color-sage)',
  primaryDeep: 'var(--color-sage-dark)',
  track: 'var(--color-sage-100)',
  onDark: '#ffffff',
  axisText: 'var(--color-ink-subtle)',
  grid: 'var(--color-glass-line)',
  cursor: 'var(--color-sage-300)',
} as const

export type ValueFormatter = (value: number) => string

export const defaultValueFormatter: ValueFormatter = (value) => String(value)

/** useId() React 19 bisa berisi karakter yang merusak `url(#id)` di SVG → bersihkan. */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
}
