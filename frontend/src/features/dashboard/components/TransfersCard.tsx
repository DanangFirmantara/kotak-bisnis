import { ArrowUpRight } from 'lucide-react'
import { useTransfers } from '@/hooks/useDashboard'
import { GlassCard } from '@/components/ui/GlassCard'
import { IconButton } from '@/components/common/IconButton'
import { SectionHeader } from '@/components/common/SectionHeader'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'
import { TransferItem } from './TransferItem'

const VISIBLE_COUNT = 3
const LIST = 'flex flex-col gap-4'

/** Kartu 3 transfer terakhir (masuk/keluar). */
export function TransfersCard() {
  const query = useTransfers()

  return (
    <GlassCard className="flex h-full flex-col gap-4">
      <SectionHeader
        title="Transfer Terakhir"
        action={<IconButton icon={ArrowUpRight} label="Lihat semua transfer" size="sm" />}
      />
      <QueryState
        query={query}
        loadingLabel="Memuat transfer…"
        loadingClassName={LIST}
        loading={Array.from({ length: VISIBLE_COUNT }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-9 w-1 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
        error={{ title: 'Gagal memuat transfer' }}
        empty={{
          when: (list) => list.length === 0,
          title: 'Belum ada transfer',
          description: 'Transfer masuk dan keluar akan muncul di sini.',
        }}
        stateClassName="min-h-32"
      >
        {(transfers) => (
          <ul className={LIST}>
            {transfers.slice(0, VISIBLE_COUNT).map((t) => (
              <TransferItem key={t.id} transfer={t} />
            ))}
          </ul>
        )}
      </QueryState>
    </GlassCard>
  )
}
