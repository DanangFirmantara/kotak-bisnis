import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface TrendBadgeProps {
  /** Perubahan dalam persen (12.5 = naik 12,5%) */
  value: number
  /**
   * Untuk metrik di mana turun = bagus (mis. pengeluaran), warna dibalik.
   * Panah tetap mengikuti arah angka.
   */
  invertColor?: boolean
  /** Dipakai di atas kartu highlight (sage) → latar putih transparan */
  onDark?: boolean
  className?: string
}

/** Chip persen naik/turun: warna success/danger + panah. */
export function TrendBadge({ value, invertColor = false, onDark = false, className }: TrendBadgeProps) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
  const isGood = direction === 'flat' ? null : (direction === 'up') !== invertColor
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus

  const tone = onDark
    ? 'bg-white/20 text-white'
    : isGood === null
      ? 'bg-sage-50 text-ink-muted'
      : isGood
        ? 'bg-success-soft text-sage-deep'
        : 'bg-danger-soft text-ink'

  const iconTone = onDark ? '' : isGood === null ? '' : isGood ? 'text-success' : 'text-danger'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        tone,
        className,
      )}
    >
      <Icon aria-hidden className={cn('size-3.5', iconTone)} strokeWidth={2.2} />
      {formatPercent(value, { signed: true })}
    </span>
  )
}
