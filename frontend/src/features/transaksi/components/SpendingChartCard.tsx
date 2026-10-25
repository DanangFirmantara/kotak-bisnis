import { useMemo } from 'react'
import { SectionHeader } from '@/components/common/SectionHeader'
import { StateMessage } from '@/components/common/StateMessage'
import { HorizontalBarChart } from '@/components/charts/HorizontalBarChart'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatCompact, formatCurrency, formatPercent } from '@/lib/format'
import { topNWithOthers, type RankedRow } from '@/lib/top-n'

export interface SpendingItem {
  name: string
  subtotal: number
}

export interface SpendingChartCardProps {
  /** Dari `useWatch` form yang sama → chart ikut berubah saat tabel diedit */
  items: readonly SpendingItem[]
}

const TOP_LIMIT = 8

/** Kartu "Belanja terbesar": 8 item termahal + satu bar "Lainnya (N item)". Item kosong / 0 tidak tampil. */
export function SpendingChartCard({ items }: SpendingChartCardProps) {
  const rows = useMemo(
    () =>
      topNWithOthers(
        items.map((item) => ({ label: item.name.trim() || 'Tanpa nama', value: item.subtotal })),
        { limit: TOP_LIMIT },
      ),
    [items],
  )
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  const itemCount = items.filter((item) => Number.isFinite(item.subtotal) && item.subtotal > 0).length

  return (
    <GlassCard className="flex flex-col gap-3 p-5 sm:p-6">
      <SectionHeader
        title="Belanja terbesar"
        subtitle={rows.length > 0 ? `${itemCount} item · ${formatCurrency(total)}` : undefined}
      />
      {rows.length === 0 ? (
        <StateMessage
          tone="empty"
          title="Belum ada item untuk digambar"
          description="Isi nama dan harga item di tabel — grafik muncul otomatis."
        />
      ) : (
        <HorizontalBarChart<RankedRow>
          data={rows}
          labelKey="label"
          valueKey="value"
          formatValue={(value) => formatCompact(value, { withCurrency: true })}
          formatTooltipValue={formatCurrency}
          isMuted={(row) => row.isOthers}
          getDetail={(row) => `${formatPercent(row.share * 100)} dari total belanja`}
          ariaLabel={`Grafik batang belanja terbesar, ${rows.length} bar dari ${itemCount} item`}
        />
      )}
    </GlassCard>
  )
}
