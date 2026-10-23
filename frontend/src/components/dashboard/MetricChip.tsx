import { TrendBadge } from '@/components/common/TrendBadge'
import { TEXT_MICRO } from '@/lib/responsive'
import { cn } from '@/lib/utils'

export interface MetricChipProps {
  label: string
  /** Sudah diformat (lib/format.ts) */
  value: string
  /** % perubahan → TrendBadge; null/undefined = tanpa badge */
  change?: number | null
  /** Turun = bagus (warna dibalik) */
  invertColor?: boolean
  className?: string
}

/** Chip kaca kecil label + nilai + tren — dipakai melayang di atas chart (kartu Saldo). */
export function MetricChip({ label, value, change, invertColor, className }: MetricChipProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-glass-border bg-glass-strong px-3 py-2 shadow-glass backdrop-blur-xl',
        className,
      )}
    >
      <p className={cn(TEXT_MICRO, 'text-ink-muted')}>{label}</p>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-base font-bold text-ink tabular-nums">{value}</span>
        {change !== null && change !== undefined && <TrendBadge value={change} invertColor={invertColor} />}
      </div>
    </div>
  )
}
