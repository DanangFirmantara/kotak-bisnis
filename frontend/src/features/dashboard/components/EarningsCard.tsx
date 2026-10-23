import type { EarningsSummary } from '@/types/dashboard'
import { useEarningsSummary } from '@/hooks/useDashboard'
import { formatCompact, formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/GlassCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'
import { TrendBadge } from '@/components/common/TrendBadge'
import { GaugeChart } from '@/components/charts/GaugeChart'

/** Kartu Pendapatan: total bulan ini · laba vs bulan lalu · gauge capaian target. */
export function EarningsCard() {
  const query = useEarningsSummary()

  return (
    <GlassCard className="flex h-full flex-col gap-3">
      <SectionHeader
        title="Pendapatan"
        subtitle="Total bulan ini"
        action={query.data && <TrendBadge value={query.data.changePercent} />}
      />

      <QueryState
        query={query}
        loadingLabel="Memuat pendapatan…"
        loadingClassName="flex flex-1 flex-col gap-3"
        loading={
          <>
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-3 w-52" />
            <Skeleton className="mx-auto mt-auto aspect-[2/1] w-full max-w-56 rounded-t-full rounded-b-none" />
          </>
        }
        error={{ title: 'Gagal memuat pendapatan' }}
        empty={{
          when: (d) => d.total === 0 && d.target === 0,
          title: 'Belum ada pendapatan',
          description: 'Bulan ini belum ada transaksi masuk.',
        }}
        stateClassName="min-h-40"
      >
        {(data) => <EarningsBody data={data} />}
      </QueryState>
    </GlassCard>
  )
}

function EarningsBody({ data }: { data: EarningsSummary }) {
  return (
    <>
      <p className="truncate text-2xl font-bold text-ink tabular-nums 2xl:text-3xl" title={formatCurrency(data.total)}>
        {formatCurrency(data.total)}
      </p>
      <ProfitText change={data.profitChangePercent} />
      <GaugeChart
        value={data.targetPercent}
        caption={`dari target ${formatCompact(data.target, { withCurrency: true })}`}
        className="mx-auto mt-auto max-w-56"
      />
    </>
  )
}

function ProfitText({ change }: { change: number }) {
  if (change === 0) return <p className="text-xs text-ink-muted">Laba sama dengan bulan lalu</p>

  const up = change > 0
  return (
    <p className="text-xs text-ink-muted">
      Laba{' '}
      <span className={cn('font-semibold', up ? 'text-sage-dark' : 'text-danger')}>
        {formatPercent(Math.abs(change), { fractionDigits: 0 })}
      </span>{' '}
      lebih {up ? 'tinggi' : 'rendah'} dari bulan lalu
    </p>
  )
}
