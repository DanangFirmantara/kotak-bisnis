import { StaggerItem } from '@/components/motion/Stagger'
import { StatCard, StatCardSkeleton } from '@/components/dashboard/StatCard'
import { StateMessage } from '@/components/common/StateMessage'
import { GlassCard } from '@/components/ui/GlassCard'
import { useDashboardStats } from '@/hooks/useDashboard'
import { toStatCardProps } from './stat-presets'

const SLOT_COUNT = 4

/**
 * Baris 4 kartu statistik. Dirender sebagai `StaggerItem` langsung di grid DashboardPage.
 * Key slot berbasis index supaya item yang sama dipakai dari skeleton → data (stagger tidak terulang).
 */
export function StatsRow() {
  const { data, isPending, isError, refetch } = useDashboardStats()

  if (isPending) {
    return Array.from({ length: SLOT_COUNT }, (_, i) => (
      <StaggerItem key={`stat-${i}`}>
        <StatCardSkeleton />
      </StaggerItem>
    ))
  }

  if (isError || data.length === 0) {
    return (
      <StaggerItem key="stat-state" className="col-span-full">
        <GlassCard>
          {isError ? (
            <StateMessage
              tone="error"
              title="Gagal memuat statistik"
              description="Periksa koneksi lalu coba lagi."
              onRetry={() => void refetch()}
            />
          ) : (
            <StateMessage tone="empty" title="Belum ada statistik" description="Data akan muncul setelah ada transaksi." />
          )}
        </GlassCard>
      </StaggerItem>
    )
  }

  return data.map((stat, i) => (
    <StaggerItem key={`stat-${i}`}>
      <StatCard {...toStatCardProps(stat)} />
    </StaggerItem>
  ))
}
