import { CircleCheck, TriangleAlert } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { InfoRow } from '@/components/common/InfoRow'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ReceiptValidation } from '@/types/receipt'

export interface ReceiptCheckProps {
  validation: ReceiptValidation
  /** Baris "Jumlah unit" (mode ringkas tidak membaca qty → false) */
  showQty?: boolean
}

/** Ringkasan pengecekan: total hitung vs total struk (cocok / selisih), qty vs "N ITEMS", jumlah baris bermasalah. */
export function ReceiptCheck({ validation, showQty = true }: ReceiptCheckProps) {
  const { totalMatches, difference, receiptTotal, computedTotal, computedQty, receiptQty, qtyMatches } = validation
  const issueCount = Object.keys(validation.rowIssues).length
  const ok = totalMatches && issueCount === 0

  const message =
    receiptTotal === null
      ? 'Total di struk belum diisi — isi untuk membandingkan.'
      : totalMatches
        ? 'Cocok dengan total di struk.'
        : `Selisih ${difference !== null && difference > 0 ? '+' : '−'}${formatCurrency(Math.abs(difference ?? 0))} dari total di struk.`

  return (
    <GlassCard className={cn('flex flex-col gap-3 p-5 sm:p-6', ok ? 'border-success/40' : 'border-warning/50')}>
      <div role="status" className="flex items-start gap-2.5">
        {ok ? (
          <CircleCheck aria-hidden strokeWidth={1.8} className="mt-0.5 size-5 shrink-0 text-success" />
        ) : (
          <TriangleAlert aria-hidden strokeWidth={1.8} className="mt-0.5 size-5 shrink-0 text-warning-deep" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{ok ? 'Hasil sesuai struk' : 'Perlu dicek'}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{message}</p>
        </div>
      </div>
      <dl className="flex flex-col gap-1.5">
        <InfoRow label="Total dihitung" value={formatCurrency(computedTotal)} />
        <InfoRow label="Total di struk" value={receiptTotal === null ? '-' : formatCurrency(receiptTotal)} />
        {showQty && (
          <InfoRow
            label="Jumlah unit"
            value={`${formatNumber(computedQty)}${receiptQty === null ? '' : ` dari ${formatNumber(receiptQty)} di struk${qtyMatches ? '' : ' (tidak cocok)'}`}`}
          />
        )}
        {issueCount > 0 && (
          <InfoRow
            label="Baris tidak cocok"
            value={`${formatNumber(issueCount)} baris (subtotal ≠ qty × harga − diskon)`}
            valueClassName="text-warning-deep"
          />
        )}
      </dl>
    </GlassCard>
  )
}
