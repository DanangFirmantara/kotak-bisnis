import type { Transfer } from '@/types/dashboard'
import { formatDayTime, formatSignedCurrency } from '@/lib/format'
import { TEXT_MICRO } from '@/lib/responsive'
import { cn } from '@/lib/utils'

/** Satu baris transfer: penanda arah · nama + waktu · nominal +/− berwarna. */
export function TransferItem({ transfer }: { transfer: Transfer }) {
  const incoming = transfer.direction === 'in'
  const signed = incoming ? transfer.amount : -transfer.amount

  return (
    <li className="flex items-center gap-3">
      <span aria-hidden className={cn('h-9 w-1 shrink-0 rounded-full', incoming ? 'bg-success' : 'bg-danger')} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink" title={transfer.description}>
          <span className="sr-only">{incoming ? 'Dari ' : 'Ke '}</span>
          {transfer.counterparty}
        </p>
        <p className={cn('truncate text-ink-muted', TEXT_MICRO)}>
          <time dateTime={transfer.occurredAt}>{formatDayTime(transfer.occurredAt)}</time>
        </p>
      </div>
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
          incoming ? 'bg-success-soft text-sage-deep' : 'bg-danger-soft text-danger-deep',
        )}
      >
        {formatSignedCurrency(signed)}
      </span>
    </li>
  )
}
