import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface InfoRowProps {
  label: string
  value: ReactNode
  /** Class untuk `<dd>`, mis. `font-mono` untuk hash commit */
  valueClassName?: string
  className?: string
}

/** Pasangan label–nilai kaca kecil. Wajib di dalam `<dl>` (dt/dd). Dipakai Bantuan (info aplikasi) & Health. */
export function InfoRow({ label, value, valueClassName, className }: InfoRowProps) {
  return (
    <div className={cn('min-w-0 rounded-2xl border border-glass-border bg-glass-strong px-3 py-2', className)}>
      <dt className="text-xs text-ink-muted">{label}</dt>
      <dd className={cn('mt-0.5 font-semibold break-words text-ink', valueClassName)}>{value}</dd>
    </div>
  )
}
