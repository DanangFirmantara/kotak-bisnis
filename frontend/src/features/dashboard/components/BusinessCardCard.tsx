import { Plus } from 'lucide-react'
import { useBusinessCards } from '@/hooks/useDashboard'
import { formatNumber } from '@/lib/format'
import { GlassCard } from '@/components/ui/GlassCard'
import { ActionButton } from '@/components/common/ActionButton'
import { Skeleton } from '@/components/common/Skeleton'
import { QueryState } from '@/components/dashboard/QueryState'
import { WalletCardStack } from './WalletCardStack'

const LAYOUT = 'grid h-full items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]'

/** Kartu "Kartu Bisnis di Dompet": judul + deskripsi + tombol tambah · tumpukan kartu glass 3D. */
export function BusinessCardCard() {
  const query = useBusinessCards()

  return (
    <GlassCard className="h-full">
      <div className={LAYOUT}>
        <div className="flex min-w-0 flex-col items-start gap-3">
          <h3 className="text-lg leading-snug font-bold text-ink">Kartu Bisnis di Dompet</h3>
          <p className="text-xs leading-relaxed text-ink-muted">
            {query.data && query.data.length > 0 ? (
              <>
                {formatNumber(query.data.length)} kartu terhubung ke pembayaran dan pengeluaran usaha.
                {/* Petunjuk hover hanya untuk mouse — di layar sentuh Tilt diam */}
                <span className="hidden pointer-fine:inline"> Arahkan kursor ke kartu untuk melihatnya lebih dekat.</span>
              </>
            ) : (
              'Hubungkan kartu bisnis untuk memantau pembayaran dan pengeluaran usaha di satu tempat.'
            )}
          </p>
          <ActionButton className="mt-2">
            <Plus aria-hidden strokeWidth={2.2} />
            Tambah Kartu
          </ActionButton>
        </div>

        <div className="flex min-h-40 items-center justify-center">
          <QueryState
            query={query}
            loadingLabel="Memuat kartu…"
            loadingClassName="w-full max-w-64 sm:max-w-72"
            loading={<Skeleton className="aspect-[1.586] w-full rounded-2xl" />}
            error={{ title: 'Gagal memuat kartu' }}
            empty={{
              when: (cards) => cards.length === 0,
              title: 'Belum ada kartu',
              description: 'Tambah kartu pertama untuk mulai.',
            }}
          >
            {(cards) => <WalletCardStack cards={cards} className="py-4" />}
          </QueryState>
        </div>
      </div>
    </GlassCard>
  )
}
