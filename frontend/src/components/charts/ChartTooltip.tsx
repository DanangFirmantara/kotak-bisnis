import type { TooltipContentProps } from 'recharts'
import { defaultValueFormatter, type ValueFormatter } from './chart-utils'

type ChartTooltipProps = Pick<TooltipContentProps, 'active' | 'payload' | 'label'> & {
  formatValue?: ValueFormatter
  /** Baris keterangan tambahan di bawah nilai (mis. "12,3% dari total") */
  detail?: string
}

/** Tooltip kaca untuk semua chart Recharts (dipasang via `content`). */
export function ChartTooltip({ active, payload, label, formatValue = defaultValueFormatter, detail }: ChartTooltipProps) {
  const entry = payload[0]
  if (!active || !entry) return null

  const raw: unknown = entry.value
  const value = typeof raw === 'number' ? formatValue(raw) : String(raw ?? '')

  return (
    <div className="rounded-xl border border-glass-border bg-glass-strong px-3 py-2 text-xs shadow-glass backdrop-blur-xl">
      {label !== undefined && label !== '' && <p className="text-ink-muted">{label}</p>}
      <p className="font-semibold text-ink tabular-nums">{value}</p>
      {detail && <p className="text-ink-muted">{detail}</p>}
    </div>
  )
}
