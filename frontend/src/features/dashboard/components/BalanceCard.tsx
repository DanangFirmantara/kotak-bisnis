import { useState } from 'react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import type { BalanceOverview, BalancePeriod } from '@/types/dashboard'
import { useBalanceOverview } from '@/hooks/useDashboard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatCurrency, formatPercent } from '@/lib/format'
import { MEDIA_QUERY } from '@/lib/responsive'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { GlassSelect, type SelectOption } from '@/components/common/GlassSelect'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'
import { MetricChip } from '@/components/dashboard/MetricChip'
import { LineAreaChart } from '@/components/charts/LineAreaChart'

const PERIOD_OPTIONS: readonly SelectOption<BalancePeriod>[] = [
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' },
]

const CHART_HEIGHT = 240
/** Ruang di atas garis untuk chip yang melayang (≥ sm) */
const CHIP_INSET = 76
/** HP (< sm): chip pindah ke atas chart (alur normal, boleh 2 baris) → chart lebih pendek tanpa inset */
const MOBILE_CHART_HEIGHT = 180

/** Kartu Saldo: status target · filter periode · 2 chip melayang · line area chart. */
export function BalanceCard() {
  const [period, setPeriod] = useState<BalancePeriod>('monthly')
  const query = useBalanceOverview(period)

  return (
    <GlassCard className="flex h-full flex-col gap-4">
      <SectionHeader
        title="Saldo"
        titleAdornment={query.data && <TargetStatus onTrack={query.data.onTrack} />}
        action={<GlassSelect value={period} onChange={setPeriod} options={PERIOD_OPTIONS} label="Periode saldo" />}
      />

      <QueryState
        query={query}
        loadingLabel="Memuat saldo…"
        loadingClassName="relative"
        loading={
          <div style={{ height: CHART_HEIGHT }}>
            <div className="flex gap-3">
              <Skeleton className="h-14 w-32 rounded-2xl" />
              <Skeleton className="h-14 w-40 rounded-2xl" />
            </div>
            <Skeleton className="absolute inset-x-0 bottom-0 h-32 rounded-2xl" />
          </div>
        }
        error={{ title: 'Gagal memuat saldo', description: 'Grafik saldo tidak dapat ditampilkan.' }}
        empty={{
          when: (d) => d.points.length === 0,
          title: 'Belum ada riwayat saldo',
          description: 'Coba pilih periode lain.',
        }}
        stateClassName="min-h-40"
      >
        {(data) => <BalanceChart data={data} isRefreshing={query.isPlaceholderData} />}
      </QueryState>
    </GlassCard>
  )
}

function BalanceChart({ data, isRefreshing }: { data: BalanceOverview; isRefreshing: boolean }) {
  // Layout chip diatur class (sm:absolute); tinggi chart Recharts butuh angka → ikut breakpoint yang sama
  const floatingChips = useMediaQuery(MEDIA_QUERY.sm)

  return (
    <div className={cn('relative transition-opacity', isRefreshing && 'opacity-60')} aria-busy={isRefreshing}>
      <div className="mb-3 flex flex-wrap gap-2 sm:absolute sm:top-0 sm:left-0 sm:z-10 sm:mb-0 sm:gap-3">
        <MetricChip label="Rasio pemasukan" value={formatPercent(data.ratioPercent)} change={data.ratioChangePercent} />
        <MetricChip label="Saldo" value={formatCurrency(data.currentBalance)} change={data.balanceChangePercent} />
      </div>
      <LineAreaChart
        data={data.points}
        xKey="label"
        yKey="balance"
        height={floatingChips ? CHART_HEIGHT : MOBILE_CHART_HEIGHT}
        insetTop={floatingChips ? CHIP_INSET : undefined}
        formatValue={formatCurrency}
      />
    </div>
  )
}

function TargetStatus({ onTrack }: { onTrack: boolean }) {
  const Icon = onTrack ? CircleCheck : CircleAlert
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink-muted">
      <Icon aria-hidden className={cn('size-3.5', onTrack ? 'text-success' : 'text-danger')} strokeWidth={2} />
      {onTrack ? 'Sesuai target' : 'Di bawah target'}
    </span>
  )
}
